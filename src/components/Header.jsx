// components/EmployeeHeader.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  BellIcon,
  UserCircleIcon,
  XMarkIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Header = ({ userName = 'Employee' }) => {
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const adminRef = useRef(null);
  const socketRef = useRef(null);

  const playNotificationSound = (isChat = false) => {
    const soundUrl = isChat ? '/sounds/chat-notification.mp3' : '/sounds/notification.mp3';
    const sound = new Audio(soundUrl);
    sound.play().catch((err) => console.error('Play error:', err));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    let formatted = date.toLocaleString('en-US', options);
    formatted = formatted.replace(/:/, '.');
    formatted = formatted.replace(/AM|PM/, (match) => match.toLowerCase());
    return formatted;
  };

  useEffect(() => {
    socketRef.current = io('https://backend-6bli.onrender.com', { withCredentials: true });

    const token = sessionStorage.getItem('employeeToken');
    const getIdFromToken = (jwt) => {
      try {
        if (!jwt) return null;
        const base64Url = jwt.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const parsed = JSON.parse(jsonPayload);
        return parsed.id || parsed._id || null;
      } catch (e) {
        return null;
      }
    };

    const derivedId = sessionStorage.getItem('employeeId') || getIdFromToken(token);
    if (derivedId) {
      sessionStorage.setItem('employeeId', derivedId);
      socketRef.current.emit('join', derivedId, 'employee');
    }

    socketRef.current.on('newNotification', (notification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) {
          return prev;
        }
        const isChat = notification.type === 'chat';
        playNotificationSound(isChat);

        // Custom toast for chat notifications
        if (isChat) {
          toast(
            <div className="flex items-start gap-2">
              <ChatBubbleLeftIcon className="h-6 w-6 text-blue-400" />
              <div>
                <p className="font-semibold text-white">{notification.senderName || 'Unknown'}</p>
                <p className="text-sm text-gray-200">{notification.message}</p>
                <p className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>,
            {
              position: 'bottom-right',
              autoClose: notification.isPersistent ? false : 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              style: {
                background: '#113a69',
                color: '#ffffff',
                borderLeft: '4px solid #3b82f6',
              },
              onClick: () => {
                if (notification.chatId) {
                  navigate(`/chat/${notification.chatId}`);
                }
              },
            }
          );
        } else {
          // Default toast for non-chat notifications
          toast.info(notification.message, {
            position: 'bottom-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: {
              background: '#113a69',
              color: '#ffffff',
            },
          });
        }
        return [notification, ...prev];
      });
    });

    socketRef.current.on('notificationDeleted', ({ id }) => {
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
    });

    fetchNotifications();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('https://backend-6bli.onrender.com/employee/notifications', {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('employeeToken')}`,
          'x-user-id': sessionStorage.getItem('employeeId') || '',
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`https://backend-6bli.onrender.com/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('employeeToken')}`,
        },
      });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const response = await fetch(`https://backend-6bli.onrender.com/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('employeeToken')}`,
          'x-user-id': sessionStorage.getItem('employeeId') || '',
        },
      });
      if (response.ok) {
        setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setOpenNotifications(false);
      }
      if (adminRef.current && !adminRef.current.contains(event.target)) {
        setOpenAdmin(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('employeeToken');
    sessionStorage.removeItem('employeeId');
    navigate('/login');
  };

  return (
    <header className="flex items-center bg-white shadow-md px-6 py-3 sticky top-0 z-50">
      <div className="flex-1">
        <div className="flex items-center px-3 py-2">
          <ClockIcon className="h-5 w-5 text-gray-500" />
          <span className="ml-2 text-sm text-gray-700">{formatDate(currentTime)}</span>
        </div>
      </div>

      <div className="flex-1 flex justify-center"></div>

      <div className="flex-1 flex items-center justify-end gap-6">
        <div className="relative" ref={notifRef}>
          <BellIcon
            className="h-6 w-6 text-gray-600 cursor-pointer hover:text-[#113a69] transition-colors"
            onClick={() => setOpenNotifications(!openNotifications)}
          />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#113a69] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}

          {openNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border shadow-lg rounded-md overflow-hidden z-50">
              <h4 className="font-semibold text-gray-700 px-4 py-2 border-b">
                Notifications
              </h4>
              <ul className="max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((note) => (
                    <li
                      key={note._id}
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-600 flex justify-between items-center ${note.read ? 'opacity-50' : ''
                        }`}
                      onClick={() => {
                        if (!note.read) markAsRead(note._id);
                        if (note.type === 'chat' && note.chatId) {
                          navigate(`/chat/${note.chatId}`);
                        }
                      }}
                    >
                      <div className="flex-1 flex items-start gap-2">
                        {note.type === 'chat' && (
                          <ChatBubbleLeftIcon className="h-5 w-5 text-blue-400" />
                        )}
                        <div>
                          {note.type === 'chat' && (
                            <p className="font-semibold">{note.senderName || 'Unknown'}</p>
                          )}
                          <span>{note.message}</span>
                          <span className="text-xs text-gray-400 block">
                            {new Date(note.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(note._id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </li>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-400">
                    No notifications
                  </div>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="relative" ref={adminRef}>
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-full px-2 py-1 transition-colors"
            onClick={() => setOpenAdmin(!openAdmin)}
          >
            <UserCircleIcon className="h-8 w-8 text-gray-600" />
            <span className="text-gray-700 font-medium text-sm">{userName}</span>
          </div>

          {openAdmin && (
            <div className="absolute right-0 mt-2 w-44 bg-white border shadow-lg rounded-md overflow-hidden z-50">
              <button
                onClick={() => {
                  navigate('/settings');
                  setOpenAdmin(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </header>
  );
};

export default Header;