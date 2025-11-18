/*
 * Wii Interface for AI Gaming Bridge
 * Handles communication between Wii hardware and AI engine
 * 
 * This module provides low-level access to Wii Remote data,
 * game state management, and AI integration hooks.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <gccore.h>
#include <wiiuse/wpad.h>
#include <fat.h>
#include <network.h>

// AI Bridge includes
#include "ai_bridge.h"
#include "game_state.h"
#include "wii_interface.h"

// Constants
#define MAX_PLAYERS 4
#define AI_UPDATE_INTERVAL 16  // 60 FPS
#define GESTURE_BUFFER_SIZE 32
#define NETWORK_BUFFER_SIZE 1024

// Global variables
static bool ai_bridge_initialized = false;
static WiiPlayer players[MAX_PLAYERS];
static GameState current_game_state;
static GestureBuffer gesture_buffers[MAX_PLAYERS];
static u32 frame_counter = 0;

// Network communication
static s32 network_socket = -1;
static char network_buffer[NETWORK_BUFFER_SIZE];

/*
 * Initialize the Wii AI Bridge system
 */
int wii_ai_bridge_init(void) {
    printf("Initializing Wii AI Bridge...\n");
    
    // Initialize video system
    VIDEO_Init();
    
    // Initialize Wii Remote system
    WPAD_Init();
    WPAD_SetDataFormat(WPAD_CHAN_ALL, WPAD_FMT_BTNS_ACC_IR);
    
    // Initialize FAT filesystem
    if (!fatInitDefault()) {
        printf("Error: Could not initialize FAT filesystem\n");
        return -1;
    }
    
    // Initialize network for AI communication
    if (init_network() < 0) {
        printf("Warning: Network initialization failed, AI features limited\n");
    }
    
    // Initialize player data
    for (int i = 0; i < MAX_PLAYERS; i++) {
        init_player(&players[i], i);
        init_gesture_buffer(&gesture_buffers[i]);
    }
    
    // Initialize game state
    init_game_state(&current_game_state);
    
    ai_bridge_initialized = true;
    printf("Wii AI Bridge initialized successfully!\n");
    return 0;
}

/*
 * Initialize network communication with AI engine
 */
static int init_network(void) {
    // Initialize network subsystem
    s32 result = net_init();
    if (result < 0) {
        printf("Network init failed: %d\n", result);
        return -1;
    }
    
    // Create socket for AI communication
    network_socket = net_socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (network_socket < 0) {
        printf("Socket creation failed: %d\n", network_socket);
        return -1;
    }
    
    printf("Network initialized for AI communication\n");
    return 0;
}

/*
 * Initialize player data structure
 */
static void init_player(WiiPlayer* player, int player_id) {
    player->id = player_id;
    player->connected = false;
    player->skill_level = 0.5f;  // Start at medium skill
    player->ai_assistance_level = 0.3f;
    
    // Initialize input history
    memset(&player->input_history, 0, sizeof(InputHistory));
    player->input_history.write_index = 0;
    
    // Initialize AI profile
    player->ai_profile.learning_rate = 0.1f;
    player->ai_profile.adaptation_speed = 0.05f;
    strcpy(player->ai_profile.play_style, "balanced");
    
    printf("Player %d initialized\n", player_id);
}

/*
 * Initialize gesture recognition buffer
 */
static void init_gesture_buffer(GestureBuffer* buffer) {
    buffer->write_index = 0;
    buffer->sample_count = 0;
    memset(buffer->samples, 0, sizeof(buffer->samples));
}

/*
 * Initialize game state
 */
static void init_game_state(GameState* state) {
    state->game_type = GAME_TYPE_MENU;
    state->current_level = 0;
    state->difficulty = 0.5f;
    state->ai_enabled = true;
    state->frame_count = 0;
    
    for (int i = 0; i < MAX_PLAYERS; i++) {
        state->player_scores[i] = 0;
    }
}

/*
 * Main update loop for AI bridge
 */
void wii_ai_bridge_update(void) {
    if (!ai_bridge_initialized) return;
    
    frame_counter++;
    current_game_state.frame_count = frame_counter;
    
    // Scan for Wii Remote input
    WPAD_ScanPads();
    
    // Update each connected player
    for (int i = 0; i < MAX_PLAYERS; i++) {
        if (WPAD_Probe(i, NULL) == WPAD_ERR_NONE) {
            players[i].connected = true;
            update_player_input(&players[i], i);
            
            // Process AI enhancements every few frames
            if (frame_counter % AI_UPDATE_INTERVAL == 0) {
                process_ai_for_player(&players[i], i);
            }
        } else {
            players[i].connected = false;
        }
    }
    
    // Update game state with AI
    if (frame_counter % AI_UPDATE_INTERVAL == 0) {
        update_game_ai();
    }
}

/*
 * Update player input and store in history
 */
static void update_player_input(WiiPlayer* player, int channel) {
    WPADData* data = WPAD_Data(channel);
    if (!data) return;
    
    // Get current input snapshot
    InputSnapshot* current = &player->input_history.snapshots[player->input_history.write_index];
    
    // Store button data
    current->buttons_held = data->btns_h;
    current->buttons_pressed = data->btns_d;
    current->buttons_released = data->btns_u;
    
    // Store accelerometer data
    current->accel.x = data->accel.x;
    current->accel.y = data->accel.y;
    current->accel.z = data->accel.z;
    
    // Store IR pointer data
    if (data->ir.valid) {
        current->ir.valid = true;
        current->ir.x = data->ir.x;
        current->ir.y = data->ir.y;
        current->ir.angle = data->ir.angle;
    } else {
        current->ir.valid = false;
    }
    
    // Store gyroscope data (if available)
    if (data->exp.type == WPAD_EXP_MOTION_PLUS) {
        current->gyro.pitch = data->exp.mp.pitch;
        current->gyro.roll = data->exp.mp.roll;
        current->gyro.yaw = data->exp.mp.yaw;
        current->gyro.valid = true;
    } else {
        current->gyro.valid = false;
    }
    
    // Update timestamp
    current->timestamp = gettime();
    
    // Update gesture buffer
    update_gesture_buffer(&gesture_buffers[channel], current);
    
    // Advance write index
    player->input_history.write_index = (player->input_history.write_index + 1) % INPUT_HISTORY_SIZE;
    if (player->input_history.count < INPUT_HISTORY_SIZE) {
        player->input_history.count++;
    }
}

/*
 * Update gesture recognition buffer
 */
static void update_gesture_buffer(GestureBuffer* buffer, InputSnapshot* input) {
    GestureSample* sample = &buffer->samples[buffer->write_index];
    
    // Store accelerometer data
    sample->accel_x = input->accel.x;
    sample->accel_y = input->accel.y;
    sample->accel_z = input->accel.z;
    
    // Store gyroscope data if available
    if (input->gyro.valid) {
        sample->gyro_pitch = input->gyro.pitch;
        sample->gyro_roll = input->gyro.roll;
        sample->gyro_yaw = input->gyro.yaw;
    }
    
    sample->timestamp = input->timestamp;
    
    // Advance buffer
    buffer->write_index = (buffer->write_index + 1) % GESTURE_BUFFER_SIZE;
    if (buffer->sample_count < GESTURE_BUFFER_SIZE) {
        buffer->sample_count++;
    }
}

/*
 * Process AI enhancements for a specific player
 */
static void process_ai_for_player(WiiPlayer* player, int channel) {
    if (!player->connected) return;
    
    // Analyze recent input patterns
    GestureAnalysis gesture = analyze_gesture_pattern(&gesture_buffers[channel]);
    
    // Send data to AI engine for processing
    AIRequest request;
    prepare_ai_request(&request, player, &gesture, &current_game_state);
    
    // Get AI response
    AIResponse response;
    if (send_ai_request(&request, &response) == 0) {
        apply_ai_response(player, &response);
    }
    
    // Update player skill estimation
    update_skill_estimation(player, &gesture);
}

/*
 * Analyze gesture patterns from buffer
 */
static GestureAnalysis analyze_gesture_pattern(GestureBuffer* buffer) {
    GestureAnalysis analysis;
    memset(&analysis, 0, sizeof(analysis));
    
    if (buffer->sample_count < 3) {
        analysis.confidence = 0.0f;
        return analysis;
    }
    
    // Calculate motion intensity
    float total_motion = 0.0f;
    for (int i = 1; i < buffer->sample_count; i++) {
        int prev_idx = (buffer->write_index - i - 1 + GESTURE_BUFFER_SIZE) % GESTURE_BUFFER_SIZE;
        int curr_idx = (buffer->write_index - i + GESTURE_BUFFER_SIZE) % GESTURE_BUFFER_SIZE;
        
        GestureSample* prev = &buffer->samples[prev_idx];
        GestureSample* curr = &buffer->samples[curr_idx];
        
        float dx = curr->accel_x - prev->accel_x;
        float dy = curr->accel_y - prev->accel_y;
        float dz = curr->accel_z - prev->accel_z;
        
        total_motion += sqrtf(dx*dx + dy*dy + dz*dz);
    }
    
    analysis.intensity = total_motion / (buffer->sample_count - 1);
    
    // Simple gesture classification
    if (analysis.intensity > 0.8f) {
        analysis.type = GESTURE_SWING;
        analysis.confidence = 0.8f;
    } else if (analysis.intensity > 0.3f) {
        analysis.type = GESTURE_POINT;
        analysis.confidence = 0.6f;
    } else {
        analysis.type = GESTURE_IDLE;
        analysis.confidence = 0.9f;
    }
    
    return analysis;
}

/*
 * Prepare AI request packet
 */
static void prepare_ai_request(AIRequest* request, WiiPlayer* player, 
                              GestureAnalysis* gesture, GameState* game_state) {
    request->player_id = player->id;
    request->timestamp = gettime();
    
    // Copy gesture data
    memcpy(&request->gesture, gesture, sizeof(GestureAnalysis));
    
    // Copy recent input history
    request->input_count = min(player->input_history.count, 5);  // Last 5 inputs
    for (int i = 0; i < request->input_count; i++) {
        int idx = (player->input_history.write_index - i - 1 + INPUT_HISTORY_SIZE) % INPUT_HISTORY_SIZE;
        memcpy(&request->recent_inputs[i], &player->input_history.snapshots[idx], sizeof(InputSnapshot));
    }
    
    // Copy game state
    memcpy(&request->game_state, game_state, sizeof(GameState));
    
    // Copy player profile
    memcpy(&request->player_profile, &player->ai_profile, sizeof(AIProfile));
}

/*
 * Send AI request and receive response
 */
static int send_ai_request(AIRequest* request, AIResponse* response) {
    if (network_socket < 0) {
        // Fallback to local AI processing
        return process_ai_locally(request, response);
    }
    
    // Serialize request to JSON (simplified)
    char json_buffer[2048];
    serialize_ai_request(request, json_buffer, sizeof(json_buffer));
    
    // Send to AI engine
    struct sockaddr_in ai_server;
    ai_server.sin_family = AF_INET;
    ai_server.sin_port = htons(8080);  // AI engine port
    inet_aton("192.168.1.100", &ai_server.sin_addr);  // AI engine IP
    
    int sent = net_sendto(network_socket, json_buffer, strlen(json_buffer), 0,
                         (struct sockaddr*)&ai_server, sizeof(ai_server));
    
    if (sent < 0) {
        printf("Failed to send AI request: %d\n", sent);
        return -1;
    }
    
    // Receive response (with timeout)
    socklen_t addr_len = sizeof(ai_server);
    int received = net_recvfrom(network_socket, network_buffer, NETWORK_BUFFER_SIZE - 1, 0,
                               (struct sockaddr*)&ai_server, &addr_len);
    
    if (received > 0) {
        network_buffer[received] = '\0';
        return deserialize_ai_response(network_buffer, response);
    }
    
    return -1;
}

/*
 * Local AI processing fallback
 */
static int process_ai_locally(AIRequest* request, AIResponse* response) {
    // Simple local AI processing
    response->player_id = request->player_id;
    response->timestamp = gettime();
    
    // Basic difficulty adjustment
    float performance = estimate_player_performance(request);
    response->difficulty_adjustment = (performance - 0.6f) * 0.1f;  // Target 60% success
    
    // Basic input enhancement
    response->input_enhancement.enabled = true;
    response->input_enhancement.sensitivity_multiplier = 1.0f + (0.5f - request->player_profile.skill_level) * 0.2f;
    
    // Simple NPC behavior
    response->npc_behavior.aggression = 0.3f + request->game_state.difficulty * 0.4f;
    response->npc_behavior.intelligence = 0.5f + request->player_profile.skill_level * 0.3f;
    
    return 0;
}

/*
 * Apply AI response to player
 */
static void apply_ai_response(WiiPlayer* player, AIResponse* response) {
    // Update difficulty
    current_game_state.difficulty += response->difficulty_adjustment;
    current_game_state.difficulty = fmaxf(0.1f, fminf(1.0f, current_game_state.difficulty));
    
    // Update player assistance level
    if (response->input_enhancement.enabled) {
        player->ai_assistance_level = response->input_enhancement.sensitivity_multiplier;
    }
    
    // Update AI profile
    player->ai_profile.adaptation_speed = response->learning_rate_adjustment;
}

/*
 * Update game-wide AI systems
 */
static void update_game_ai(void) {
    // Update NPCs based on current game state
    for (int i = 0; i < MAX_PLAYERS; i++) {
        if (players[i].connected) {
            update_npc_behavior_for_player(&players[i]);
        }
    }
    
    // Adjust global difficulty
    adjust_global_difficulty();
    
    // Generate dynamic content if needed
    if (current_game_state.game_type == GAME_TYPE_ADVENTURE) {
        generate_dynamic_content();
    }
}

/*
 * Estimate player performance for AI feedback
 */
static float estimate_player_performance(AIRequest* request) {
    // Simple performance estimation based on gesture accuracy and timing
    float accuracy = request->gesture.confidence;
    float consistency = calculate_input_consistency(request);
    
    return (accuracy + consistency) / 2.0f;
}

/*
 * Calculate input consistency for performance estimation
 */
static float calculate_input_consistency(AIRequest* request) {
    if (request->input_count < 2) return 0.5f;
    
    float total_variance = 0.0f;
    for (int i = 1; i < request->input_count; i++) {
        InputSnapshot* prev = &request->recent_inputs[i-1];
        InputSnapshot* curr = &request->recent_inputs[i];
        
        float time_diff = curr->timestamp - prev->timestamp;
        total_variance += fabsf(time_diff - 16.67f);  // 60 FPS target
    }
    
    float avg_variance = total_variance / (request->input_count - 1);
    return fmaxf(0.0f, 1.0f - (avg_variance / 50.0f));  // Normalize
}

/*
 * Get enhanced input for game logic
 */
WiiInput wii_ai_get_enhanced_input(int player_id) {
    WiiInput enhanced_input;
    memset(&enhanced_input, 0, sizeof(enhanced_input));
    
    if (player_id < 0 || player_id >= MAX_PLAYERS || !players[player_id].connected) {
        return enhanced_input;
    }
    
    WiiPlayer* player = &players[player_id];
    InputSnapshot* latest = &player->input_history.snapshots[
        (player->input_history.write_index - 1 + INPUT_HISTORY_SIZE) % INPUT_HISTORY_SIZE
    ];
    
    // Copy basic input
    enhanced_input.buttons = latest->buttons_held;
    enhanced_input.accel = latest->accel;
    enhanced_input.ir = latest->ir;
    enhanced_input.gyro = latest->gyro;
    
    // Apply AI enhancements
    if (player->ai_assistance_level > 0.0f) {
        // Enhance motion sensitivity
        enhanced_input.accel.x *= player->ai_assistance_level;
        enhanced_input.accel.y *= player->ai_assistance_level;
        enhanced_input.accel.z *= player->ai_assistance_level;
        
        // Add gesture prediction
        GestureAnalysis gesture = analyze_gesture_pattern(&gesture_buffers[player_id]);
        enhanced_input.predicted_gesture = gesture.type;
        enhanced_input.gesture_confidence = gesture.confidence;
    }
    
    return enhanced_input;
}

/*
 * Get current game state
 */
GameState* wii_ai_get_game_state(void) {
    return &current_game_state;
}

/*
 * Set game type for AI optimization
 */
void wii_ai_set_game_type(GameType type) {
    current_game_state.game_type = type;
    printf("AI Bridge: Game type set to %d\n", type);
}

/*
 * Cleanup AI bridge resources
 */
void wii_ai_bridge_cleanup(void) {
    if (network_socket >= 0) {
        net_close(network_socket);
        network_socket = -1;
    }
    
    ai_bridge_initialized = false;
    printf("Wii AI Bridge cleaned up\n");
}
