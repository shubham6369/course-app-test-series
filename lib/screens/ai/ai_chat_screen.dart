import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../models/models.dart';
import '../../theme.dart';

/// 24/7 AI Academic Tutor Chat Interface
class AiChatScreen extends StatefulWidget {
  const AiChatScreen({super.key});

  @override
  State<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends State<AiChatScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<AiMessage> _messages = [
    AiMessage(
      id: 'welcome_1',
      sender: 'ai',
      text: 'Hello! I am your 24/7 AI Academic Tutor. Ask me any conceptual question in Physics, Chemistry, Biology, or Mathematics!',
      timestamp: DateTime.now(),
    ),
  ];

  List<String> _suggestions = [
    'Explain Lenz\'s Law with an example',
    'What is Le Chatelier\'s Principle?',
    'Explain the Krebs Cycle stages',
    'Derive the quadratic formula',
  ];

  bool _isTyping = false;

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage(String text) async {
    final query = text.trim();
    if (query.isEmpty) return;

    _textController.clear();
    final userMsg = AiMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      sender: 'user',
      text: query,
      timestamp: DateTime.now(),
    );

    setState(() {
      _messages.add(userMsg);
      _isTyping = true;
    });
    _scrollToBottom();

    try {
      final reply = await _apiService.askAiChat(query);
      if (mounted) {
        setState(() {
          _messages.add(
            AiMessage(
              id: (DateTime.now().millisecondsSinceEpoch + 1).toString(),
              sender: 'ai',
              text: reply.message,
              timestamp: DateTime.now(),
            ),
          );
          if (reply.suggestions.isNotEmpty) {
            _suggestions = reply.suggestions;
          }
          _isTyping = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add(
            AiMessage(
              id: (DateTime.now().millisecondsSinceEpoch + 1).toString(),
              sender: 'ai',
              text: 'I could not generate an explanation at this moment. Please check your network and try again.',
              timestamp: DateTime.now(),
            ),
          );
          _isTyping = false;
        });
        _scrollToBottom();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.auto_awesome, color: AppColors.accent, size: 20),
            SizedBox(width: 8),
            Text('AI Academic Tutor'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded),
            tooltip: 'Clear Chat',
            onPressed: () {
              setState(() {
                _messages.clear();
                _messages.add(
                  AiMessage(
                    id: 'welcome_1',
                    sender: 'ai',
                    text: 'Chat history cleared. How can I help you today?',
                    timestamp: DateTime.now(),
                  ),
                );
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // 1. Chat Message Area
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                final isUser = message.sender == 'user';
                return _buildMessageBubble(message, isUser);
              },
            ),
          ),

          // 2. Typing indicator
          if (_isTyping)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              child: Row(
                children: [
                  const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'AI Tutor is formulating an explanation...',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 12,
                      fontStyle: FontStyle.italic,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),

          // 3. Prompt chips suggestion carousel
          if (_suggestions.isNotEmpty)
            Container(
              height: 44,
              margin: const EdgeInsets.symmetric(vertical: 4),
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                itemCount: _suggestions.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final prompt = _suggestions[i];
                  return ActionChip(
                    avatar: const Icon(Icons.lightbulb_outline, size: 16, color: AppColors.primary),
                    label: Text(
                      prompt,
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 11,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    backgroundColor: Colors.white,
                    side: const BorderSide(color: AppColors.border),
                    onPressed: () => _sendMessage(prompt),
                  );
                },
              ),
            ),

          // 4. Input field
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(AiMessage msg, bool isUser) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.82,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isUser ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isUser ? 16 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 16),
          ),
          border: isUser ? null : Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(5),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!isUser) ...[
              const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.auto_awesome, size: 14, color: AppColors.accent),
                  SizedBox(width: 6),
                  Text(
                    'AI Tutor',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
            ],
            Text(
              msg.text,
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 13.5,
                height: 1.45,
                color: isUser ? Colors.white : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: TextField(
                  controller: _textController,
                  decoration: const InputDecoration(
                    hintText: 'Ask any question or concept...',
                    hintStyle: TextStyle(fontFamily: 'Poppins', fontSize: 13),
                    border: InputBorder.none,
                  ),
                  onSubmitted: _sendMessage,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Material(
              color: AppColors.primary,
              shape: const CircleBorder(),
              child: InkWell(
                customBorder: const CircleBorder(),
                onTap: () => _sendMessage(_textController.text),
                child: const Padding(
                  padding: EdgeInsets.all(12),
                  child: Icon(Icons.send_rounded, size: 18, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

