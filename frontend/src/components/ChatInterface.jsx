import SendIcon from '@mui/icons-material/Send';
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from '../api/axiosInstance';
import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { BASE_URI } from '../api/config';

function ChatInterface() {
  const [tabValue, setTabValue] = useState(0);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openCreateChat, setOpenCreateChat] = useState(false);
  const [chatForm, setChatForm] = useState({ name: '', type: 'private', is_whisper_space: false });
  const token = useSelector((state) => state.auth.token);
  const websocketRef = useRef(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/chats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(response.data);
        setError(null);
      } catch (error) {
        setError(error.response?.data?.detail || 'Failed to fetch chats');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchChats();
  }, [token]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`/chats/${selectedChat.id}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMessages(response.data);
        } catch (error) {
          setError(error.response?.data?.detail || 'Failed to fetch messages');
        }
      };
      fetchMessages();
    }
  }, [selectedChat, token]);

  // WebSocket connection
  useEffect(() => {
    if (selectedChat && token) {
      const wsUrl = `${BASE_URI.replace('http', 'ws')}/ws/${selectedChat.id}?token=${token}`;
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, {
          id: message.id,
          chat_id: selectedChat.id,
          sender_id: message.sender_id || message.sender,
          content: message.content,
          timestamp: message.timestamp,
          is_whisper: message.is_whisper,
          self_destruct_timer: message.self_destruct_timer,
          attachments: message.attachments,
        }]);
      };

      websocketRef.current.onclose = () => {
        console.log('WebSocket closed');
      };

      websocketRef.current.onerror = (error) => {
        setError('WebSocket connection error', error);
      };

      return () => {
        websocketRef.current?.close();
      };
    }
  }, [selectedChat, token]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    try {
      const messageData = {
        content: newMessage,
        is_whisper: false,
        self_destruct_timer: 0,
      };
      websocketRef.current.send(JSON.stringify(messageData));
      setNewMessage('');
    } catch (error) {
      setError('Failed to send message', error);
    }
  };

  const handleCreateChat = async () => {
    try {
      const response = await axios.post('/chats', chatForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats([...chats, response.data]);
      setOpenCreateChat(false);
      setChatForm({ name: '', type: 'private', is_whisper_space: false });
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to create chat');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: { xs: 'calc(100vh - 56px)', sm: '100vh' }, bgcolor: '#f5f6fa' }}>
      {/* Sidebar */}
      <Paper
        elevation={2}
        sx={{
          width: { xs: '100%', sm: 280 },
          display: 'flex',
          flexDirection: 'column',
          borderRight: { xs: 'none', sm: '1px solid #ddd' },
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          aria-label="Chats and Groups tabs"
        >
          <Tab label="CHATS" />
          <Tab label="GROUPS" disabled />
        </Tabs>
        <Divider />
        <Button
          variant="contained"
          sx={{ m: 2 }}
          onClick={() => setOpenCreateChat(true)}
        >
          Create New Chat
        </Button>
        {loading ? (
          <Typography sx={{ p: 2 }}>Loading chats...</Typography>
        ) : error ? (
          <Typography sx={{ p: 2, color: 'red' }}>{error}</Typography>
        ) : (
          <List sx={{ flex: 1, overflowY: 'auto' }}>
            {chats.length === 0 && <Typography sx={{ p: 2 }}>No chats found.</Typography>}
            {chats.map((chat) => (
              <ListItem
                key={chat.id}
                button
                onClick={() => setSelectedChat(chat)}
                sx={{
                  '&:hover': { bgcolor: '#eaf3ff' },
                  bgcolor: selectedChat?.id === chat.id ? '#eaf3ff' : 'transparent',
                }}
              >
                <ListItemAvatar>
                  <Avatar>{chat.name?.[0] || 'C'}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: 600 }}>
                      {chat.name || `${chat.type} Chat`}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.secondary">
                        {chat.type}
                      </Typography>
                      <Typography sx={{ float: 'right', fontSize: '0.75rem', color: 'gray' }}>
                        {new Date(chat.updated_at).toLocaleTimeString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Chat Section */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        {selectedChat ? (
          <Box
            sx={{
              bgcolor: '#0091ea',
              color: '#fff',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: '#007acc' }}>{selectedChat.name?.[0] || 'C'}</Avatar>
            <Box>
              <Typography variant="h6">{selectedChat.name || `${selectedChat.type} Chat`}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {selectedChat.is_whisper_space ? 'Whisper Space' : selectedChat.type}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 2, bgcolor: '#0091ea', color: '#fff' }}>
            <Typography variant="h6">Select a chat to start messaging</Typography>
          </Box>
        )}

        {/* Messages */}
        <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: msg.sender_id === 'me' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: msg.sender_id === 'me' ? '#0091ea' : '#fff',
                  color: msg.sender_id === 'me' ? '#fff' : '#000',
                  borderRadius: 2,
                  maxWidth: '70%',
                }}
              >
                <Typography>{msg.content}</Typography>
                {msg.is_whisper && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                    Whisper
                  </Typography>
                )}
                {msg.self_destruct_timer > 0 && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    Self-destructs in {msg.self_destruct_timer}s
                  </Typography>
                )}
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Message Input */}
        {selectedChat && (
          <Box sx={{ display: 'flex', p: 2, borderTop: '1px solid #ddd', bgcolor: '#fff' }}>
            <TextField
              fullWidth
              placeholder="Type a message..."
              variant="outlined"
              size="small"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              sx={{ mr: 1 }}
              aria-label="Message input"
            />
            <IconButton
              color="primary"
              sx={{ bgcolor: '#0091ea', color: '#fff' }}
              onClick={handleSendMessage}
              aria-label="Send message"
            >
              <SendIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Create Chat Dialog */}
      <Dialog open={openCreateChat} onClose={() => setOpenCreateChat(false)}>
        <DialogTitle>Create New Chat</DialogTitle>
        <DialogContent>
          <TextField
            label="Chat Name"
            value={chatForm.name}
            onChange={(e) => setChatForm({ ...chatForm, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Chat Type</InputLabel>
            <Select
              value={chatForm.type}
              onChange={(e) => setChatForm({ ...chatForm, type: e.target.value })}
            >
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="group">Group</MenuItem>
              <MenuItem value="secret">Secret</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateChat(false)}>Cancel</Button>
          <Button onClick={handleCreateChat} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ChatInterface;