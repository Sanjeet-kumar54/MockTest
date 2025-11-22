
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Image, X, ChevronUp, Camera } from './icons/Icons';
import { chatWithAssistant } from '../services/geminiService';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    image?: string;
}

const ChatAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hello! I'm your MockTest AI Assistant. How can I help you today? You can ask me questions or upload an image of a problem to solve!", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    // Trigger MathJax when new messages arrive
    useEffect(() => {
        if (isOpen && (window as any).MathJax) {
            setTimeout(() => {
                if ((window as any).MathJax.typesetPromise) {
                    (window as any).MathJax.typesetPromise();
                }
            }, 100);
        }
    }, [messages, isOpen]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!input.trim() && !selectedImage) || isLoading) return;

        const userMsgId = Date.now().toString();
        const userMessage: Message = {
            id: userMsgId,
            text: input,
            sender: 'user',
            image: imagePreview || undefined
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setSelectedImage(null);
        setImagePreview(null);
        setIsLoading(true);

        try {
            // Prepare history for context (last 5 messages to save tokens)
            const history = messages.slice(-5).map(m => ({
                role: m.sender === 'bot' ? 'model' : 'user' as 'model' | 'user',
                text: m.text
            }));

            const response = await chatWithAssistant(history, userMessage.text, selectedImage || undefined);
            
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat failed", error);
            setMessages(prev => [...prev, { id: Date.now().toString(), text: "Sorry, something went wrong. Please try again.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-gray-800 w-96 sm:w-[28rem] h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 mb-4 transition-all animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-primary p-4 flex justify-between items-center text-white">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">MockTest AI</h3>
                                <span className="text-xs text-blue-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span> Online
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                                    msg.sender === 'user' 
                                        ? 'bg-primary text-white rounded-br-none' 
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm'
                                }`}>
                                    {msg.image && (
                                        <img src={msg.image} alt="User upload" className="max-w-full h-auto rounded-lg mb-2 border border-white/20" />
                                    )}
                                    <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                        {imagePreview && (
                            <div className="mb-2 relative inline-block">
                                <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600" />
                                <button 
                                    onClick={clearImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            {/* Gallery Input */}
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleImageSelect}
                            />
                            {/* Camera Input (Mobile) */}
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment"
                                ref={cameraInputRef}
                                className="hidden"
                                onChange={handleImageSelect}
                            />
                            
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                title="Upload image"
                            >
                                <Image className="w-5 h-5" />
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => cameraInputRef.current?.click()}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                title="Take photo"
                            >
                                <Camera className="w-5 h-5" />
                            </button>

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask or upload a problem..."
                                className="flex-grow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() && !selectedImage}
                                className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Launcher Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
            >
                {isOpen ? (
                    <ChevronUp className="w-6 h-6 transform rotate-180 transition-transform" />
                ) : (
                    <Bot className="w-7 h-7" />
                )}
                {!isOpen && (
                    <span className="absolute right-full mr-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs font-bold px-2 py-1 rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Need Help?
                    </span>
                )}
            </button>
        </div>
    );
};

export default ChatAssistant;
