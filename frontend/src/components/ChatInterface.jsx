import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
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
  InputAdornment,
  Chip,
  alpha,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import axios from '../api/axiosInstance';
import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { BASE_URI } from '../api/config';

// Telegram-inspired theme
const telegramTheme = createTheme({
  palette: {
    primary: {
      main: '#0088cc',
    },
    background: {
      default: '#e5e5e7',
      paper: '#ffffff',
    },
    text: {
      primary: '#17212b',
      secondary: '#6b7280',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&:hover': {
            backgroundColor: '#f2f2f7',
          },
          '&.Mui-selected': {
            backgroundColor: '#e6f3ff',
            '&:hover': { backgroundColor: '#d1e8ff' },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },
        indicator: {
          height: 2,
          backgroundColor: '#0088cc',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
  },
});

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
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const websocketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  

  useEffect(() => {
    if (messages.length > 0) {
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      setIsInitialLoad(true);
      setMessages([]);
    }
  }, [selectedChat]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Fetch messages
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

  // WebSocket
  useEffect(() => {
    if (selectedChat && token) {
      const wsUrl = `${BASE_URI.replace('http', 'ws')}/ws/${selectedChat.id}?token=${token}`;
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          {
            id: message.id,
            chat_id: selectedChat.id,
            sender_id: message.sender_id || message.sender,
            content: message.content,
            timestamp: message.timestamp,
            is_whisper: message.is_whisper,
            self_destruct_timer: message.self_destruct_timer,
            attachments: message.attachments,
          },
        ]);
      };

      websocketRef.current.onclose = () => {
        console.log('WebSocket closed');
      };

      websocketRef.current.onerror = () => {
        setError('WebSocket connection error');
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
      setError('Failed to send message');
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

  const telegramBlue = '#0088cc';
  const telegramLightBlue = '#add8e6';
  const telegramDark = '#17212b';

  return (
    <ThemeProvider theme={telegramTheme}>
      <Box
        sx={{
          display: 'flex',
          height: { xs: 'calc(100vh - 56px)', sm: '100vh' },
          bgcolor: 'background.default',
        }}
      >
        {/* Sidebar */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', sm: 360 },
            maxWidth: 360,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <IconButton sx={{ color: telegramBlue }} aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, color: telegramDark }}>
              Chats
            </Typography>
            <IconButton
              sx={{ color: telegramBlue }}
              onClick={() => setOpenCreateChat(true)}
              aria-label="New Chat"
            >
              <AddIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              fullWidth
              placeholder="Search"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f2f2f7',
                  '& fieldset': { border: 'none' },
                  '&:hover': { bgcolor: '#e8e8ed' },
                  '&.Mui-focused': { bgcolor: 'white', boxShadow: `0 0 0 2px ${alpha(telegramBlue, 0.2)}` },
                },
              }}
              aria-label="Search chats"
            />
          </Box>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontWeight: 500,
                fontSize: '0.875rem',
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>Chats</Typography>
                  <Chip
                    label={chats.length}
                    size="small"
                    sx={{
                      fontSize: '0.65rem',
                      height: 18,
                      bgcolor: telegramBlue,
                      color: 'white',
                    }}
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon sx={{ fontSize: 18 }} />
                  <Typography>Groups</Typography>
                </Box>
              }
              disabled
            />
          </Tabs>

          <List sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
            {loading ? (
              <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                Loading chats...
              </Typography>
            ) : error ? (
              <Typography sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>{error}</Typography>
            ) : filteredChats.length === 0 ? (
              <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                No chats found
              </Typography>
            ) : (
              filteredChats.map((chat) => (
                <ListItem
                  key={chat.id}
                  button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    setSelectedChat(chat);
                  }}
                  selected={selectedChat?.id === chat.id}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderLeft: selectedChat?.id === chat.id ? `4px solid ${telegramBlue}` : 'none',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: telegramLightBlue,
                        color: telegramBlue,
                        fontWeight: 600,
                      }}
                    >
                      {chat.name?.[0]?.toUpperCase() || 'C'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          color: telegramDark,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {chat.name || `${chat.type} Chat`}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.85rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {chat.type.charAt(0).toUpperCase() + chat.type.slice(1)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                        >
                          {new Date(chat.updated_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </Paper>

        {/* Chat Section */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
          {selectedChat ? (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar sx={{ width: 40, height: 40, bgcolor: telegramLightBlue, color: telegramBlue }}>
                {selectedChat.name?.[0]?.toUpperCase() || 'C'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: telegramDark }}>
                  {selectedChat.name || `${selectedChat.type} Chat`}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {selectedChat.is_whisper_space ? 'Whisper Space' : selectedChat.type}
                </Typography>
              </Box>
              <IconButton sx={{ color: 'text.secondary' }} aria-label="Search messages">
                <SearchIcon />
              </IconButton>
              <IconButton sx={{ color: 'text.secondary' }} aria-label="Menu">
                <MenuIcon />
              </IconButton>
            </Paper>
          ) : (
            <Paper
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: telegramDark }}>
                Select a chat to start messaging
              </Typography>
            </Paper>
          )}

          <Box
            ref={messagesContainerRef}
            sx={{ flex: 1, p: 3, overflowY: 'auto', bgcolor: 'background.default' }}
          >
            {messages.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'text.secondary',
                }}
              >
                <Typography variant="h6">No messages yet</Typography>
                <Typography variant="body2">Start a conversation by sending a message</Typography>
              </Box>
            ) : (
              messages.map((msg, index) => (
                <Box
                  key={msg.id}
                  ref={index === messages.length - 1 ? messagesEndRef : null}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.sender_id === 'me' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: msg.sender_id === 'me' ? telegramBlue : 'background.paper',
                      color: msg.sender_id === 'me' ? 'white' : 'text.primary',
                      borderRadius: 3,
                      borderBottomLeftRadius: msg.sender_id === 'me' ? 12 : 3,
                      borderBottomRightRadius: msg.sender_id !== 'me' ? 12 : 3,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                      maxWidth: '70%',
                      position: 'relative',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: msg.sender_id === 'me' ? 'auto' : '-8px',
                        right: msg.sender_id === 'me' ? '-8px' : 'auto',
                        width: 0,
                        height: 0,
                        border: '8px solid transparent',
                        borderRightColor: msg.sender_id === 'me' ? telegramBlue : 'background.paper',
                        borderBottomColor: msg.sender_id === 'me' ? telegramBlue : 'background.paper',
                        borderLeftColor: msg.sender_id === 'me' ? 'transparent' : 'background.paper',
                        borderTopColor: 'transparent',
                      },
                    }}
                  >
                    <Typography sx={{ wordBreak: 'break-word' }}>{msg.content}</Typography>
                    {msg.is_whisper && (
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', mt: 0.5, fontStyle: 'italic', opacity: 0.8 }}
                      >
                        Whisper
                      </Typography>
                    )}
                    {msg.self_destruct_timer > 0 && (
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}
                      >
                        Self-destructs in {msg.self_destruct_timer}s
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        textAlign: 'right',
                        mt: 0.5,
                        opacity: 0.7,
                        fontSize: '0.75rem',
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Paper>
                </Box>
              ))
            )}
          </Box>

          {selectedChat && (
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                p: 1.5,
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <TextField
                fullWidth
                placeholder="Type a message..."
                variant="outlined"
                size="small"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                sx={{
                  mr: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f2f2f7',
                    '& fieldset': { border: 'none' },
                    '&:hover': { bgcolor: '#e8e8ed' },
                    '&.Mui-focused': { bgcolor: 'white', boxShadow: `0 0 0 2px ${alpha(telegramBlue, 0.2)}` },
                  },
                }}
                aria-label="Message input"
              />
              <IconButton
                sx={{
                  bgcolor: newMessage.trim() ? telegramBlue : 'grey.300',
                  color: 'white',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    bgcolor: newMessage.trim() ? '#006ba3' : 'grey.400',
                  },
                }}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                aria-label="Send message"
              >
                <SendIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Paper>
          )}
        </Box>

        <Dialog open={openCreateChat} onClose={() => setOpenCreateChat(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ bgcolor: telegramBlue, color: 'white', fontWeight: 600 }}>
            Create New Chat
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              label="Chat Name"
              value={chatForm.name}
              onChange={(e) => setChatForm({ ...chatForm, name: e.target.value })}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Chat Type</InputLabel>
              <Select
                value={chatForm.type}
                onChange={(e) => setChatForm({ ...chatForm, type: e.target.value })}
                label="Chat Type"
              >
                <MenuItem value="private">Private</MenuItem>
                <MenuItem value="group">Group</MenuItem>
                <MenuItem value="secret">Secret</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenCreateChat(false)}
              sx={{ color: telegramBlue }}
              aria-label="Cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChat}
              variant="contained"
              disabled={!chatForm.name.trim()}
              sx={{ bgcolor: telegramBlue, '&:hover': { bgcolor: '#006ba3' } }}
              aria-label="Create chat"
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default ChatInterface;