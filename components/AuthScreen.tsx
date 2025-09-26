
import React, { useState } from 'react';
import { User } from '../types';
import { authenticateUser, saveUser } from '../services/storageService';
import { GarvisLogo, LockIcon, MailIcon } from './icons';

interface AuthScreenProps {
    isLocked: boolean;
    currentUser: User | null;
    onLogin: (user: User) => void;
    onUnlock: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgotPassword' | 'resetConfirmation';

const AuthScreen: React.FC<AuthScreenProps> = ({ isLocked, currentUser, onLogin, onUnlock }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const resetFormState = () => {
        // Keep email for forgot password flow
        // setEmail(''); 
        setPassword('');
        setUsername('');
        setConfirmPassword('');
        setError(null);
        setSuccessMessage(null);
    };

    const handleModeChange = (newMode: AuthMode) => {
        resetFormState();
        setMode(newMode);
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        const user = authenticateUser(email, password);
        if (user) {
            onLogin(user);
        } else {
            setError('Invalid email or password.');
        }
    };
    
    const handleUnlockSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (currentUser && password === currentUser.password) {
            setPassword('');
            onUnlock();
        } else {
            setError('Incorrect password.');
        }
    }

    const handleSignUpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!username || !email || !password) {
            setError("All fields are required.");
            return;
        }
        try {
            saveUser({ username, email, password });
            handleModeChange('login');
            setSuccessMessage("Account created successfully! Please log in.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not create account.");
        }
    };

    const handleForgotPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // This is a simulation. In a real app, you'd call a backend service.
        setMode('resetConfirmation');
    };
    
    const renderLockedScreen = () => (
        <div className="w-full max-w-sm rounded-xl glass-panel p-6 text-[var(--sol-text-primary)] animate-fade-in">
             <div className="flex flex-col items-center text-center">
                 <div className="h-20 w-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-4xl mb-4 border-2 border-white/20">
                    {currentUser?.username.charAt(0)}
                </div>
                <h2 className="text-2xl font-bold">{currentUser?.username}</h2>
                <p className="text-[var(--sol-text-secondary)]">System is locked.</p>
             </div>
             <form onSubmit={handleUnlockSubmit} className="space-y-4 mt-6">
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-2 bg-[var(--sol-bg-end)] text-[var(--sol-text-primary)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)]"
                        autoFocus
                    />
                </div>
                 {error && <p className="text-red-300 bg-red-900/30 p-2 rounded-md text-sm text-center border border-red-500/50">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[var(--sol-accent-orange)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg shadow-md"
                >
                    Unlock
                </button>
             </form>
        </div>
    );
    
    const renderHeader = (title: string, subtitle: string) => (
         <div className="text-center mb-6">
            <GarvisLogo className="h-10 w-10 mx-auto text-[var(--sol-accent-cyan)] mb-2"/>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-[var(--sol-text-secondary)]">{subtitle}</p>
        </div>
    );

    const renderLogin = () => (
        <>
            {renderHeader("Welcome to GARVIS OS", "Log in to continue.")}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full px-4 py-2 bg-[var(--sol-bg-end)] text-[var(--sol-text-primary)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)]" required />
                </div>
                <div>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-2 bg-[var(--sol-bg-end)] text-[var(--sol-text-primary)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)]" required />
                </div>
                 <div className="text-right text-sm">
                    <button type="button" onClick={() => handleModeChange('forgotPassword')} className="font-semibold text-[var(--sol-text-secondary)] hover:text-[var(--sol-accent-cyan)] hover:underline">Forgot Password?</button>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[var(--sol-accent-cyan)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg shadow-md">
                    Log In
                </button>
                <p className="text-center text-sm text-[var(--sol-text-secondary)]">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => handleModeChange('signup')} className="font-semibold text-[var(--sol-accent-cyan)] hover:underline">Create one</button>
                </p>
            </form>
        </>
    );

    const renderSignup = () => (
        <>
            {renderHeader("Create Account", "Join the GARVIS network.")}
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full px-4 py-2 bg-[var(--sol-bg-end)] text-[var(--sol-text-primary)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)]" required />
                </div>
                <div>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full px-4 py-2 bg-[var(--sol-bg-end)] text-[var(--sol-text-primary)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)]" required />
                </div>
                <div>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-2 bg-[var(--sol-bg-end)] text-[var(--sol-text-primary)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)]" required />
                </div>
                <div>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="w-full px-4 py-2 bg-[var(--sol-bg-end)] text-[var(--sol-text-primary)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)]" required />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[var(--sol-accent-orange)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg shadow-md">
                    Create Account
                </button>
                <p className="text-center text-sm text-[var(--sol-text-secondary)]">
                    Already have an account?{' '}
                    <button type="button" onClick={() => handleModeChange('login')} className="font-semibold text-[var(--sol-accent-cyan)] hover:underline">Log in</button>
                </p>
            </form>
        </>
    );
    
    const renderForgotPassword = () => (
         <>
            {renderHeader("Reset Password", "Enter your email to receive instructions.")}
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full px-4 py-2 bg-[var(--sol-bg-end)] text-[var(--sol-text-primary)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)]" required autoFocus />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[var(--sol-accent-cyan)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg shadow-md">
                    Send Reset Instructions
                </button>
                <div className="text-center">
                    <button type="button" onClick={() => handleModeChange('login')} className="font-semibold text-sm text-[var(--sol-text-secondary)] hover:text-[var(--sol-accent-cyan)] hover:underline">
                        Back to Login
                    </button>
                </div>
            </form>
        </>
    );
    
    const renderResetConfirmation = () => (
        <>
            {renderHeader("Check Your Email", "Password reset instructions sent.")}
            <div className="text-center space-y-4">
                <MailIcon className="h-16 w-16 mx-auto text-[var(--sol-accent-cyan)] opacity-75" />
                <p className="text-[var(--sol-text-secondary)]">
                    If an account exists for <span className="font-semibold text-[var(--sol-text-primary)]">{email}</span>, you will receive an email with instructions on how to reset your password.
                </p>
                <button 
                    onClick={() => handleModeChange('login')} 
                    className="w-full bg-gradient-to-r from-[var(--sol-accent-cyan)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg shadow-md"
                >
                    Return to Login
                </button>
            </div>
        </>
    );

    const renderContent = () => {
        switch (mode) {
            case 'login': return renderLogin();
            case 'signup': return renderSignup();
            case 'forgotPassword': return renderForgotPassword();
            case 'resetConfirmation': return renderResetConfirmation();
            default: return renderLogin();
        }
    };

    return (
        <>
           {isLocked && currentUser ? renderLockedScreen() : (
                <div className="w-full max-w-md rounded-xl glass-panel p-6 text-[var(--sol-text-primary)] animate-fade-in">
                    {successMessage && <p className="text-green-300 bg-green-900/30 p-2 rounded-md text-sm text-center mb-4 border border-green-500/50">{successMessage}</p>}
                    {error && <p className="text-red-300 bg-red-900/30 p-2 rounded-md text-sm text-center mb-4 border border-red-500/50">{error}</p>}
                    {renderContent()}
                </div>
            )}
        </>
    );
};

export default AuthScreen;
