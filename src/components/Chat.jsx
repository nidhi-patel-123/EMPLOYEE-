// Chat.jsx (Employee)
import React, { useState, useEffect, useRef } from "react";
import {
  FaArrowLeft,
  FaVideo,
  FaPhoneAlt,
  FaEllipsisV,
  FaSmile,
  FaPaperclip,
  FaCamera,
} from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import axios from "axios";
import io from "socket.io-client";
import "./chat.css";

function Chat() {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const chatBodyRef = useRef(null);
  const [employee, setEmployee] = useState({ name: "", _id: "" });
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("https://backend-6bli.onrender.com", {
      withCredentials: true,
    });

    const token = sessionStorage.getItem("employeeToken");
    const getIdFromToken = (jwt) => {
      try {
        if (!jwt) return null;
        const base64Url = jwt.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const parsed = JSON.parse(jsonPayload);
        return parsed.id || parsed._id || null;
      } catch (e) {
        return null;
      }
    };
    const derivedId = sessionStorage.getItem("employeeId") || getIdFromToken(token);
    socketRef.current.emit("join", derivedId || null, "employee");

    socketRef.current.on("newMessage", (message) => {
      if (message.chatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chatId]);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = sessionStorage.getItem("employeeToken");
        if (!token) return;

        const res = await axios.get("https://backend-6bli.onrender.com/employee/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEmployee({ name: res.data.name, _id: res.data._id });
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployee();
  }, []);

  useEffect(() => {
    const fetchChatAndMessages = async () => {
      try {
        let id = chatId;

        if (!id && employee._id && employee.name) {
          const res = await axios.post("https://backend-6bli.onrender.com/chat/create", {
            employeeId: employee._id,
            employeeName: employee.name,
          });
          id = res.data._id;
          setChatId(id);
        }

        if (id) {
          const res = await axios.get(`https://backend-6bli.onrender.com/msg/${id}`);
          setMessages(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchChatAndMessages();
  }, [chatId, employee]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !chatId) return;
    try {
      const res = await axios.post("https://backend-6bli.onrender.com/msg/", {
        chatId,
        sender: employee.name,
        receiver: "admin",
        message: text,
      });
      setMessages((prev) => [...prev, res.data]);
      setText("");
      socketRef.current.emit("newMessage", res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-left">
            <FaArrowLeft className="icon" />
            <div className="profile-initial">{getInitial("Admin")}</div>
            <span className="chat-name">Admin</span>
          </div>
          <div className="chat-right">
            <FaVideo className="icon" />
            <FaPhoneAlt className="icon" />
            <FaEllipsisV className="icon" />
          </div>
        </div>

        <div className="chat-body" ref={chatBodyRef}>
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`chat-message ${msg.sender === "admin" ? "admin-msg" : "employee-msg"
                }`}
            >
              <div className="chat-initial">
                {getInitial(msg.sender === "admin" ? "Admin" : employee.name)}
              </div>
              <div className="chat-bubble">
                <b>{msg.sender === "admin" ? "Admin" : employee.name}</b>
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <div className="input-box">
            <FaSmile className="icon" />
            <input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <FaPaperclip className="icon" />
            <FaCamera className="icon" />
          </div>
          <button className="send-btn" onClick={sendMessage}>
            <IoSend />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;