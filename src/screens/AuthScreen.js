import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebase';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail, sendEmailVerification, reload,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { rs, fs } from '../constants/theme';

const BRAND = {
  plum: '#3A233A',
  dustyRose: '#E2A9A7',
  white: '#FFFFFF',
  slateMid: '#64748B',
  slateLight: '#94A3B8',
  bgInput: '#FBF9FB',
};

function Field({ label, value, onChange, placeholder, secure, keyboard }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: rs(18) }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputRow}>
        <TextInput
          style={[s.input, { flex: 1 }]}
          value={value} onChangeText={onChange}
          placeholder={placeholder} placeholderTextColor={BRAND.slateLight}
          secureTextEntry={secure && !show}
          keyboardType={keyboard || 'default'}
          autoCapitalize="none" autoCorrect={false}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShow(v => !v)} style={{ padding: rs(10) }}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={rs(16)} color={BRAND.slateMid} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function Btn({ label, onPress, outline, loading, disabled, bg }) {
  const btnBg = bg || BRAND.dustyRose;
  return (
    <TouchableOpacity
      style={[s.btn,
        { backgroundColor: outline ? 'transparent' : btnBg },
        outline && { borderWidth: 1, borderColor: BRAND.plum },
        (loading || disabled) && { opacity: 0.6 },
        !outline && s.btnShadow
      ]}
      onPress={onPress} activeOpacity={0.85} disabled={loading || disabled}>
      <Text style={[s.btnText, { color: outline ? BRAND.plum : BRAND.white }]}>
        {loading ? 'Please wait...' : label}
      </Text>
    </TouchableOpacity>
  );
}

function VerifyScreen({ user, onVerified }) {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  useEffect(() => {
    const interval = setInterval(async () => {
      try { await reload(user); if (user.emailVerified) { clearInterval(interval); onVerified(); } } catch (e) {}
    }, 4000);
    return () => clearInterval(interval);
  }, [user]);
  return (
    <View style={s.card}>
      <Text style={{ fontSize: fs(40), textAlign: 'center', marginBottom: rs(16) }}>✉️</Text>
      <Text style={s.cardTitle}>Verify email</Text>
      <Text style={s.cardSub}>{'We sent a link to\n'}<Text style={{ fontWeight: '600', color: BRAND.plum }}>{user.email}</Text>{'\n\nClick the link then tap below.'}</Text>
      <Btn label="I've verified my email ✓"
        onPress={async () => {
          setChecking(true);
          try {
            await reload(user);
            await auth.currentUser?.reload();
          } catch (e) {}
          if (auth.currentUser?.emailVerified) {
            // App.js auth listener will detect this and show the app
            onVerified();
          } else {
            Alert.alert('Not verified yet', 'Please click the link in your inbox first, then try again.');
          }
          setChecking(false);
        }} loading={checking} />
      <TouchableOpacity onPress={() => onVerified()} style={{ alignItems: 'center', marginTop: rs(16) }}>
        <Text style={[s.link, { color: BRAND.slateMid }]}>Back to sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={async () => {
        setResending(true);
        await sendEmailVerification(user);
        Alert.alert('Sent!', 'A new verification email has been sent.');
        setResending(false);
      }} style={{ alignItems: 'center', marginTop: rs(12) }} disabled={resending}>
        <Text style={[s.link, { color: BRAND.slateMid }]}>Resend email</Text>
      </TouchableOpacity>
    </View>
  );
}

function SignupScreen({ onSwitch, onNeedsVerification }) {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading]   = useState(false);
  const validate = () => {
    if (!username.trim()) return 'Please enter a username.';
    if (!email.trim())    return 'Please enter your email.';
    if (password !== confirm) return 'Passwords don\'t match.';
    if (password.length < 8)  return 'Password must be at least 8 characters.';
    if (!agreedToTerms)   return 'Please agree to the Terms of Service and Community Guidelines.';
    return null;
  };
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Create Account</Text>
      <Text style={s.cardSub}>Join the purl maker community</Text>
      <Field label="Username"         value={username} onChange={setUsername} placeholder="e.g. YarnWitch" />
      <Field label="Email Address"    value={email}    onChange={setEmail}    placeholder="you@example.com" keyboard="email-address" />
      <Field label="Password"         value={password} onChange={setPassword} placeholder="Min 8 characters" secure />
      <Field label="Confirm Password" value={confirm}  onChange={setConfirm}  placeholder="Re-enter password" secure />

      {/* Terms of Service checkbox */}
      <TouchableOpacity
        onPress={() => setAgreedToTerms(v => !v)}
        style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: rs(16), gap: rs(10) }}
        activeOpacity={0.7}>
        <View style={{
          width: rs(20), height: rs(20), borderRadius: rs(5),
          borderWidth: 1.5, borderColor: agreedToTerms ? BRAND.dustyRose : BRAND.slateLight,
          backgroundColor: agreedToTerms ? BRAND.dustyRose : 'transparent',
          alignItems: 'center', justifyContent: 'center', marginTop: rs(2),
        }}>
          {agreedToTerms && <Ionicons name="checkmark" size={rs(14)} color={BRAND.white} />}
        </View>
        <Text style={{ flex: 1, fontSize: fs(11.5), color: BRAND.slateMid, lineHeight: fs(17) }}>
          I agree to the <Text style={{ color: BRAND.plum, fontWeight: '600' }}>Terms of Service</Text> and the <Text style={{ color: BRAND.plum, fontWeight: '600' }}>Community Guidelines</Text>. I will not post abusive, harassing, or unlawful content, and I understand that violations may result in removal from Purl.
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: rs(6) }}>
        <Btn label="Sign Up" loading={loading} onPress={async () => {
          const err = validate();
          if (err) { Alert.alert('Check details', err); return; }
          setLoading(true);
          try {
            const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
            // Fire off verification email but don't block — user can verify later
            sendEmailVerification(cred.user).catch(() => {});
            await setDoc(doc(db, 'profiles', cred.user.uid), {
              username: username.trim(), email: email.trim().toLowerCase(),
              bio: '', crafts: [], projects: [], joinedClubs: [],
              agreedToTermsAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            });
            // App.js auth listener will pick this up and show the main app
          } catch (e) { Alert.alert('Signup failed', e.message); }
          setLoading(false);
        }} />
      </View>
      <View style={s.divider}><View style={s.divLine} /><Text style={s.divText}>or</Text><View style={s.divLine} /></View>
      <Btn label="Already have an account? Sign In" outline onPress={onSwitch} />
    </View>
  );
}

function LoginScreen({ onSwitch, onForgot, onNeedsVerification, onSignedIn }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Welcome Back</Text>
      <Text style={s.cardSub}>Sign in to your maker workspace</Text>
      <Field label="Email Address" value={email}    onChange={setEmail}    placeholder="you@example.com" keyboard="email-address" />
      <Field label="Password"      value={password} onChange={setPassword} placeholder="Your password" secure />
      <TouchableOpacity onPress={onForgot} style={{ alignItems: 'flex-end', marginTop: rs(-6), marginBottom: rs(24) }}>
        <Text style={s.forgotLink}>Forgot password?</Text>
      </TouchableOpacity>
      <Btn label="Sign In" loading={loading} onPress={async () => {
        if (!email || !password) { Alert.alert('Missing fields', 'Please enter email and password.'); return; }
        setLoading(true);
        try {
          await signInWithEmailAndPassword(auth, email.trim(), password);
          // App.js auth listener takes over from here
          onSignedIn && onSignedIn();
        } catch (e) { Alert.alert('Login failed', e.message); }
        setLoading(false);
      }} />
      <View style={s.divider}><View style={s.divLine} /><Text style={s.divText}>or</Text><View style={s.divLine} /></View>
      <Btn label="Create an Account" outline onPress={onSwitch} />
    </View>
  );
}

function ForgotScreen({ onBack }) {
  const [email, setEmail]   = useState('');
  const [loading, setLoad]  = useState(false);
  const [sent, setSent]     = useState(false);
  if (sent) return (
    <View style={s.card}>
      <Text style={{ fontSize: fs(40), textAlign: 'center', marginBottom: rs(12) }}>✉️</Text>
      <Text style={s.cardTitle}>Reset Sent</Text>
      <Text style={s.cardSub}>Check your inbox for a password reset link.</Text>
      <Btn label="Back to Sign In" onPress={onBack} />
    </View>
  );
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Reset Password</Text>
      <Text style={s.cardSub}>Enter your email to receive a secure recovery link.</Text>
      <Field label="Email Address" value={email} onChange={setEmail} placeholder="you@example.com" keyboard="email-address" />
      <Btn label="Send Link" loading={loading} onPress={async () => {
        if (!email.trim()) { Alert.alert('Enter your email first'); return; }
        setLoad(true);
        try { await sendPasswordResetEmail(auth, email.trim()); setSent(true); }
        catch (e) { Alert.alert('Error', e.message); }
        setLoad(false);
      }} />
      <TouchableOpacity onPress={onBack} style={{ alignItems: 'center', marginTop: rs(16) }}>
        <Text style={[s.link, { color: BRAND.slateMid }]}>Cancel and go back</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AuthScreen({ onAuthed }) {
  const [screen, setScreen]     = useState('login');
  const [verifyUser, setVerify] = useState(null);
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#2C1A2C" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.hero}>
            <Text style={s.heroTitle}>Purl</Text>
            <Text style={s.heroSub}>crochet · knitting · sewing</Text>
          </View>
          {verifyUser ? (
            <VerifyScreen user={verifyUser} onVerified={() => { setVerify(null); onAuthed && onAuthed(); }} />
          ) : (
            <>
              {screen === 'login'  && <LoginScreen  onSwitch={() => setScreen('signup')} onForgot={() => setScreen('forgot')} onNeedsVerification={setVerify} onSignedIn={() => onAuthed && onAuthed()} />}
              {screen === 'signup' && <SignupScreen onSwitch={() => setScreen('login')}  onNeedsVerification={setVerify} />}
              {screen === 'forgot' && <ForgotScreen onBack={() => setScreen('login')} />}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: BRAND.plum, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: rs(24), paddingBottom: rs(40) },
  hero:      { alignItems: 'center', marginBottom: rs(44), marginTop: rs(10) },
  heroIcon:  { width: rs(104), height: rs(104), borderRadius: rs(52), backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', marginBottom: rs(16), overflow: 'hidden' },
  iconInsideSquare: { width: '100%', height: '100%', transform: [{ scale: 1.45 }] },
  heroTitle: { fontSize: fs(56), fontWeight: '300', color: BRAND.white, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', letterSpacing: 0.5 },
  heroSub:   { fontSize: fs(13), color: BRAND.dustyRose, marginTop: rs(8), fontWeight: '400', letterSpacing: 2, textTransform: 'lowercase' },
  card:      { backgroundColor: BRAND.white, borderRadius: rs(24), paddingHorizontal: rs(24), paddingVertical: rs(32), borderWidth: 1, borderColor: 'rgba(226, 169, 167, 0.25)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 6 },
  cardTitle: { fontSize: fs(24), fontWeight: '600', color: BRAND.plum, marginBottom: rs(4), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  cardSub:   { fontSize: fs(13), color: BRAND.slateMid, marginBottom: rs(28) },
  label:     { fontSize: fs(11), fontWeight: '600', color: BRAND.plum, marginBottom: rs(6), letterSpacing: 0.3, opacity: 0.6 },
  inputRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND.bgInput, borderWidth: 1, borderColor: '#EFEAEF', borderRadius: rs(12) },
  input:     { paddingHorizontal: rs(14), paddingVertical: rs(13), fontSize: fs(14), color: BRAND.plum },
  forgotLink:{ fontSize: fs(12), color: BRAND.slateMid, fontWeight: '500', opacity: 0.8 },
  btn:       { borderRadius: rs(12), paddingVertical: rs(15), alignItems: 'center', marginBottom: rs(8) },
  btnShadow: { shadowColor: BRAND.dustyRose, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  btnText:   { fontSize: fs(14), fontWeight: '600', letterSpacing: 0.5 },
  link:      { fontSize: fs(13), fontWeight: '600' },
  divider:   { flexDirection: 'row', alignItems: 'center', marginVertical: rs(16), gap: rs(12) },
  divLine:   { flex: 1, height: 1, backgroundColor: '#F0EAF0' },
  divText:   { fontSize: fs(11), color: BRAND.slateLight, fontWeight: '500' },
});