import React, { useRef, useEffect, useMemo, useState } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    IconButton,
    CircularProgress,
    Tooltip
} from '@mui/material';
import { 
    Send as SendIcon, 
    AttachFile as AttachFileIcon, 
    Close as CloseIcon,
    Delete as DeleteIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';

const ChatWindow = ({ 
    open, 
    onClose, 
    title,
    messages, 
    onSendMessage, 
    onFileSelect, 
    onRemoveAttachment,
    attachments,
    inputText,
    onInputChange,
    currentUser
}) => {
    const chatContainerRef = useRef(null);
    const [showScroll, setShowScroll] = useState(false);
    const scrollThreshold = 48;
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
            setShowScroll(false);
        }
    };
    const handleScroll = () => {
        const el = chatContainerRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < scrollThreshold;
        setShowScroll(!atBottom);
    };
    const isImageName = (name) => {
        if (!name) return false;
        const lower = name.toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].some(ext => lower.endsWith(ext));
    };
    const previewUrls = useMemo(() => {
        if (!attachments || attachments.length === 0) return [];
        return attachments.map(f => (f && f.type && f.type.startsWith('image/')) ? URL.createObjectURL(f) : null);
    }, [attachments]);

    useEffect(() => {
        return () => {
            previewUrls.forEach(u => { if (u) URL.revokeObjectURL(u); });
        };
    }, [previewUrls]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, open]);

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                style: { borderRadius: '12px' }
            }}
        >
            <DialogTitle style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid #eee',
                padding: '1rem 1.5rem'
            }}>
                <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{title}</span>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent style={{ padding: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <div 
                        ref={chatContainerRef}
                        style={{ 
                            height: '350px', 
                            overflowY: 'auto', 
                            marginBottom: '1rem', 
                            padding: '1rem', 
                            border: '1px solid #e0e0e0', 
                            borderRadius: '8px',
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.8rem'
                        }}
                        onScroll={handleScroll}
                    >
                        {!messages || messages.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#999', marginTop: 'auto', marginBottom: 'auto' }}>
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = msg.name === currentUser?.name;
                                return (
                                    <div key={index} style={{
                                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                                        maxWidth: '75%',
                                        backgroundColor: isMe ? '#3498db' : 'white',
                                        color: isMe ? 'white' : '#2c3e50',
                                        padding: '0.6rem 1rem',
                                        borderRadius: '12px',
                                        borderBottomRightRadius: isMe ? '2px' : '12px',
                                        borderBottomLeftRadius: isMe ? '12px' : '2px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        border: isMe ? 'none' : '1px solid #eee'
                                    }}>
                                        <div style={{ 
                                            fontSize: '0.7rem', 
                                            fontWeight: 'bold', 
                                            marginBottom: '0.3rem', 
                                            color: isMe ? '#e3f2fd' : '#7f8c8d',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            {msg.name}
                                        </div>
                                        
                                        <div style={{ wordBreak: 'break-word', fontSize: '0.95rem' }}>
                                            {msg.message}
                                        </div>

                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div style={{ 
                                                marginTop: '0.5rem', 
                                                paddingTop: '0.5rem', 
                                                borderTop: `1px solid ${isMe ? 'rgba(255,255,255,0.2)' : '#eee'}`,
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                                gap: '0.5rem'
                                            }}>
                                                {msg.attachments.map((att, idx) => {
                                                    const href = `http://localhost:5000/${att.path.replace(/\\/g, '/')}`;
                                                    const displayName = att.name || att.originalName || 'Attachment';
                                                    const isImg = isImageName(att.name || att.originalName || att.path);
                                                    if (isImg) {
                                                        return (
                                                            <a key={idx} href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                                                <img 
                                                                    src={href} 
                                                                    alt={displayName} 
                                                                    style={{ width: '100%', maxWidth: '180px', height: 'auto', borderRadius: '6px', border: isMe ? '1px solid rgba(255,255,255,0.3)' : '1px solid #eee', display: 'block' }} 
                                                                />
                                                            </a>
                                                        );
                                                    }
                                                    return (
                                                        <a 
                                                            key={idx}
                                                            href={href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ 
                                                                color: isMe ? '#fff' : '#3498db', 
                                                                fontSize: '0.8rem',
                                                                textDecoration: 'none',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.3rem'
                                                            }}
                                                        >
                                                            📄 {displayName}
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <div style={{ 
                                            fontSize: '0.65rem', 
                                            marginTop: '0.3rem', 
                                            textAlign: 'right',
                                            opacity: 0.8
                                        }}>
                                            {new Date(msg.sentAt || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {showScroll && (
                        <IconButton 
                            onClick={scrollToBottom} 
                            color="primary" 
                            style={{ position: 'absolute', right: 16, bottom: 126, backgroundColor: '#fff', border: '1px solid #e0e0e0' }}
                        >
                            <KeyboardArrowDownIcon />
                        </IconButton>
                    )}

                    {attachments && attachments.length > 0 && (
                        <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: '0.5rem',
                            marginBottom: '0.8rem',
                            padding: '0.5rem',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #eee'
                        }}>
                            {attachments.map((file, index) => {
                                const isImg = file && file.type && file.type.startsWith('image/');
                                const url = previewUrls[index];
                                if (isImg && url) {
                                    return (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <img src={url} alt={file.name} style={{ width: '100%', maxWidth: '180px', height: 'auto', borderRadius: '6px', display: 'block', border: '1px solid #eee' }} />
                                            <IconButton size="small" onClick={() => onRemoveAttachment(index)} style={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#fff' }}>
                                                <DeleteIcon fontSize="inherit" color="error" />
                                            </IconButton>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={index} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.3rem', 
                                        backgroundColor: '#e3f2fd', 
                                        padding: '0.2rem 0.5rem', 
                                        borderRadius: '4px',
                                        fontSize: '0.8rem'
                                    }}>
                                        <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {file.name}
                                        </span>
                                        <IconButton size="small" onClick={() => onRemoveAttachment(index)}>
                                            <DeleteIcon fontSize="inherit" color="error" />
                                        </IconButton>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-end' }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={3}
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={(e) => onInputChange(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    onSendMessage();
                                }
                            }}
                            variant="outlined"
                            size="small"
                        />
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <input
                                type="file"
                                id="chat-file-input"
                                multiple
                                style={{ display: 'none' }}
                                onChange={onFileSelect}
                            />
                            <Tooltip title="Attach Files">
                                <IconButton onClick={() => document.getElementById('chat-file-input').click()} color="primary">
                                    <AttachFileIcon />
                                </IconButton>
                            </Tooltip>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={onSendMessage}
                                disabled={!inputText.trim() && (!attachments || attachments.length === 0)}
                                style={{ minWidth: 'auto', padding: '8px 16px' }}
                            >
                                <SendIcon />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChatWindow;
