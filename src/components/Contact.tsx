import React, { useState } from 'react';
import { Github, Linkedin, MessageCircle, Youtube, Mail, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <section id="contact" className="py-32 px-6 bg-dark-bg">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Get in Touch</h2>
          <p className="text-gray-400 text-lg">
            Feel free to reach out for collaborations or just a friendly chat
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left side - Contact Info */}
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-white mb-6">Connect With Me</h3>
              <div className="space-y-4">
                <a 
                  href="https://github.com/pleyva2004" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-c nter text-gray-300 hover:text-white transition-colors group"
                >
                  <Github size={20} className="mr-3" />
                  <span>GitHub</span>
                </a>
                <a 
                  href="https://www.linkedin.com/in/pablo-leyva" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-white transition-colors group"
                >
                  <Linkedin size={20} className="mr-3" />
                  <span>LinkedIn</span>
                </a>
                <a 
                  href="mailto:pleyva2004@gmail.com"
                  className="flex items-center text-gray-300 hover:text-white transition-colors group"
                >
                  <Mail size={20} className="mr-3" />
                  <span>pleyva2004@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6">Location</h3>
              <div className="flex items-center text-gray-300">
                <MapPin size={20} className="mr-3" />
                <span>New York City • San Francisco</span>
              </div>
            </div>
          </div>

          {/* Right side - Message Form */}
          <div>
            <h3 className="text-2xl font-semibold text-white mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              {/* Message Textarea */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors resize-none"
                  placeholder="Your message..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-dark-bg"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;