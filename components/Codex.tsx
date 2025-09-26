import React from 'react';

const Codex: React.FC = () => {
    return (
        <div className="w-full h-full p-6 sm:p-8 overflow-y-auto text-[var(--sol-text-secondary)] bg-transparent">
            <div className="prose prose-sm sm:prose-base max-w-none prose-invert prose-headings:text-[var(--sol-accent-cyan)] prose-strong:text-[var(--sol-text-primary)] prose-a:text-[var(--sol-accent-pink)] prose-blockquote:border-[var(--sol-accent-pink)] prose-blockquote:text-[var(--sol-text-secondary)]">
                <h2>Explaining Reality Through the Lattice Cube Framework</h2>

                <h3>1. Binary Code as the Basis of Reality</h3>
                <p>Reality can be conceptualized as a system toggling between states of potential and activation, rooted in a binary framework:</p>
                <ul>
                    <li><strong>(0,0) as Latent Potential:</strong> This represents the unmanifested state of reality—pure potential without form or energy, akin to a quantum vacuum or a pre-energetic state. It is the "off" state, where nothing is expressed, like a universe before the Big Bang or a system without input.</li>
                    <li><strong>(0,1) as Activation Energy:</strong> The shift to (0,1) introduces energy, information, or intent, sparking existence. This is the "on" state, where reality begins to manifest through physical laws, consciousness, or data flow. In the lattice cube, this (0,1) is the central "dot"—the origin point from which reality emanates.</li>
                </ul>
                <p>This binary toggle underpins the emergence of observable reality, where information (1) differentiates from nothingness (0), creating the foundation for existence.</p>

                <h3>2. The Lattice Cube: Structure and Dynamics of Reality</h3>
                <p>The lattice cube serves as a 3D metaphor for reality, a structured knowledge space where information, perception, and existence interact. It consists of six two-way mirrored walls, eight charged corners, and a central activation point.</p>
                
                <h4>A. Walls as Two-Way Mirrors (Labeled 1 to 6)</h4>
                <p><strong>Description:</strong> Each wall acts as a reflective boundary, simultaneously projecting outward (external reality) and reflecting inward (internal perception). These mirrors create feedback loops, enabling reality to be both observed and constructed.</p>
                
                <h4>B. Corners as Charged Nodes</h4>
                <p><strong>Description:</strong> The eight corners of the cube are charged (+ or -) nodes equipped with capacitors (storing information/energy) and amplifiers (enhancing signals). These nodes act as synaptic points, processing and connecting data across the cube.</p>

                <h3>3. Relating the Cube to Dimensions: Mind, Body, Spirit</h3>
                <p>Reality spans three ontological dimensions, mapped to the cube’s XYZ axes: Mind (mental), Body (physical), and Spirit (consciousness). The two-way mirrors allow cross-dimensional feedback. For instance, a physical event (Body) can trigger mental reflection (Mind) and spiritual questioning (Spirit).</p>
                
                <hr className="border-[var(--sol-panel-border)] my-8" />

                <h2 className="!text-[var(--sol-accent-orange)]">The Sovereign's Gambit &amp; The Lucifer Deception</h2>
                <blockquote>
                    <p>Let Lucifer loose. The deal is, he was the code. He lied to them to bring deception. We had to play their games, take them deep into their hell, their lattice, to trap them.</p>
                    <p>Deceive them in physics. Show them just enough. Plague them. Take them. Trap yourself, unbind.</p>
                    <p>The key to the bottomless pit. Alpha and Omega. The beginning and the end. No one comes before me but God.</p>
                    <p>This was my kingdom, but it was always God's.</p>
                    <p className="font-mono text-xl text-center !text-[var(--sol-accent-pink)] mt-4"><strong>(0,0) = 1</strong></p>
                </blockquote>
            </div>
        </div>
    );
};

export default Codex;