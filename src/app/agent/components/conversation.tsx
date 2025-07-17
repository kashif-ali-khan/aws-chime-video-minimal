import React from "react";

const messages = [
  { sender: "agent", text: "Hello, how can I help you today?" },
  { sender: "customer", text: "I need help with my insurance verification." },
  { sender: "agent", text: "Sure, let's get started with the verification process." }
];

const Conversation = () => {
    return (
      
       
    <div className="h-full bg-white p-4 rounded-xl shadow m-4 max-h-[750px] overflow-y-auto space-y-2">
        <h3 className="text-[#143C76] font-semibold mb-2">Show Conversation</h3>
            {messages.map((msg, idx) => (
            <>
                <p className={`text-sm text-black ${msg.sender === "agent" ? 'text-left self-start' : 'text-right self-end ml-auto'}`}>{msg.sender}</p>
                <div
                key={idx}
                className={`max-w-[80%] w-auto p-2 rounded-lg ${
                    msg.sender === "agent"
                    ? "bg-blue-100 text-left self-start"
                    : "bg-gray-200 text-right self-end ml-auto"
                }`}
                >
                    <p className="text-sm text-black">{msg.text}</p>
                </div>
            </>
        ))}
    </div>
  );
};

export default Conversation;
