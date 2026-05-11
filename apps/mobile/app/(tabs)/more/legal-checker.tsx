/**
 * @file legal-checker.tsx
 * @module app/(tabs)/more
 * @description AI Legal Checker — chat interface with quick prompts, file upload button, disclaimer.
 *              Full light + dark mode via isDark branching pattern.
 * @author BharatERP
 * @created 2025-03-10
 * @updated 2026-05-12
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { askAgent, type AskAgentResult } from '@/lib/graphql-client';
import { getAuthHeaders } from '@/lib/auth-store';
import { useState, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ── message types ─────────────────────────────────────────────── */

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  'Is RERA registration mandatory?',
  'What documents do I need?',
  'How to verify builder credentials?',
  'What is OC and why does it matter?',
  'How to check for encumbrances?',
  'What is agreement of sale vs sale deed?',
];

/* ── message bubble ──────────────────────────────────────────────── */

function MessageBubble({ msg, isDark }: { msg: Message; isDark: boolean }) {
  const isUser = msg.role === 'user';
  const bgBubble = isUser
    ? (isDark ? '#00d4aa' : '#00b894')
    : (isDark ? '#0f1623' : '#eef1f5');
  const textBubble = isUser
    ? '#080c14'
    : (isDark ? '#ffffff' : '#1a1d24');
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const timeColor = isDark ? 'rgba(255,255,255,0.35)' : '#5c6370';

  return (
    <View style={{ flexDirection: 'row', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12, alignItems: 'flex-end', gap: 8 }}>
      {!isUser && (
        <View style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: isDark ? 'rgba(0,212,170,0.15)' : 'rgba(0,184,148,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 14 }}>⚖️</Text>
        </View>
      )}
      <View style={{
        backgroundColor: bgBubble,
        borderRadius: 16,
        borderTopRightRadius: isUser ? 4 : 16,
        borderTopLeftRadius: isUser ? 16 : 4,
        borderWidth: isUser ? 0 : 1,
        borderColor,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: '75%',
      }}>
        <Text style={{ color: textBubble, fontSize: 14, lineHeight: 20 }}>{msg.text}</Text>
        <Text style={{ color: timeColor, fontSize: 10, marginTop: 4, alignSelf: 'flex-end' }}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

/* ── typing indicator ────────────────────────────────────────────── */

function TypingIndicator({ isDark }: { isDark: boolean }) {
  const bgBubble = isDark ? '#0f1623' : '#eef1f5';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const dotColor = isDark ? 'rgba(255,255,255,0.4)' : '#5c6370';

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 12, alignItems: 'flex-end', gap: 8 }}>
      <View style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: isDark ? 'rgba(0,212,170,0.15)' : 'rgba(0,184,148,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 14 }}>⚖️</Text>
      </View>
      <View style={{ backgroundColor: bgBubble, borderRadius: 16, borderWidth: 1, borderColor, paddingHorizontal: 18, paddingVertical: 14 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: dotColor,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

/* ── main component ──────────────────────────────────────────────── */

export default function LegalCheckerScreen() {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: '⚖️ Welcome to Legal Checker!\n\nI can help you with:\n• RERA verification & builder credentials\n• Document analysis (sale deed, title, NOC)\n• Legal risk scoring for properties\n• Encumbrance & dispute checks\n\nAsk me anything about property law in India.',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const msgIdRef = useRef(1);

  const bgMain = isDark ? '#080c14' : '#f5f7fa';
  const bgCard = isDark ? '#0f1623' : '#eef1f5';
  const bgCard2 = isDark ? '#161d2e' : '#e4e8ee';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const textCls = isDark ? '#ffffff' : '#1a1d24';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';
  const tealColor = isDark ? '#00d4aa' : '#00b894';
  const btnText = isDark ? '#080c14' : '#ffffff';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.3)' : '#aab0ba';

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: String(msgIdRef.current++),
      role: 'user',
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const result: AskAgentResult | null = await askAgent(
        { question: trimmed, context: 'legal-checker' },
        headers,
      );

      const assistantMsg: Message = {
        id: String(msgIdRef.current++),
        role: 'assistant',
        text: result?.answer ?? "I couldn't process your question right now. Please try again or rephrase your question about property legal matters.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setError('Failed to get response. Please try again.');
      const errMsg: Message = {
        id: String(msgIdRef.current++),
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please try again or check your internet connection.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, []);

  const quickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgMain }} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef as never}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} isDark={isDark} />
          ))}
          {loading && <TypingIndicator isDark={isDark} />}
        </ScrollView>

        {/* Error banner */}
        {error && (
          <View style={{ backgroundColor: '#ff6b4a20', borderTopWidth: 1, borderTopColor: '#ff6b4a40', paddingVertical: 8, paddingHorizontal: 16 }}>
            <Text style={{ color: '#ff6b4a', fontSize: 12, textAlign: 'center' }}>{error}</Text>
          </View>
        )}

        {/* Quick prompts */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: borderColor }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {QUICK_PROMPTS.map((prompt) => (
            <Pressable
              key={prompt}
              onPress={() => quickPrompt(prompt)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 100,
                borderWidth: 1,
                borderColor: borderColor,
                backgroundColor: bgCard2,
              }}
            >
              <Text style={{ color: textMuted, fontSize: 12, fontWeight: '500' }}>{prompt}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Input row */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          backgroundColor: bgMain,
        }}>
          {/* File upload button */}
          <Pressable
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: bgCard2,
              borderWidth: 1,
              borderColor,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              // File upload placeholder - would use expo-document-picker in production
            }}
          >
            <Text style={{ fontSize: 18 }}>📎</Text>
          </Pressable>

          {/* Text input */}
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: bgCard2,
            borderRadius: 22,
            borderWidth: 1,
            borderColor,
            paddingHorizontal: 16,
          }}>
            <TextInput
              style={{ flex: 1, color: textCls, fontSize: 14, paddingVertical: 10 }}
              placeholder="Ask about RERA, documents, legal risks…"
              placeholderTextColor={placeholderColor}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              onSubmitEditing={() => sendMessage(inputText)}
              blurOnSubmit={false}
            />
          </View>

          {/* Send button */}
          <Pressable
            onPress={() => sendMessage(inputText)}
            disabled={loading || !inputText.trim()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: inputText.trim() && !loading ? tealColor : bgCard2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator color={btnText} size="small" />
            ) : (
              <Text style={{ fontSize: 18, color: inputText.trim() ? btnText : textMuted }}>➤</Text>
            )}
          </Pressable>
        </View>

        {/* Disclaimer */}
        <View style={{
          backgroundColor: bgCard,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}>
          <Text style={{ color: textMuted, fontSize: 10, textAlign: 'center', lineHeight: 15 }}>
            ⚠️ AI responses are for informational purposes only and do not constitute legal advice. Consult a registered lawyer for official guidance.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}