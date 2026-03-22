/**
 * MomlyNavigation.jsx
 * Responsive navigation for MOMLY — React Native + Web
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  ScrollView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';

const COLORS = {
  primary:     '#D9D2F1',
  primaryLight:'#fff0f5',
  primaryBg:   '#fff5f8',
  border:      '#fde8ee',
  textDark:    '#2d2d2d',
  textMuted:   '#6b6b6b',
  textPink:    '#d47a9a',
  white:       '#ffffff',
  pageBg:      '#fff9f9',
};

const BREAKPOINT = 768;

export const NAV_ITEMS = [
  { key: 'index',           label: 'Inicio',                    icon: '🏠' },
  { key: 'guias',           label: 'Guías de Recuperación',     icon: '📚', sub: 'Física y emocional' },
  { key: 'citas',           label: 'Citas y Recordatorios',     icon: '📅', sub: 'Gestiona tus citas médicas' },
  { key: 'esnormal',        label: '¿Es Normal?',               icon: '❓', sub: 'Consulta situaciones comunes' },
  { key: 'bienestar',       label: 'Bienestar Emocional',       icon: '💛', sub: 'Monitoreo de tu estado emocional' },
  { key: 'vacunas',         label: 'Calendario de Vacunación',  icon: '💉', sub: 'Lleva el control de las vacunas' },
  { key: 'biblioteca',      label: 'Biblioteca del bebé',       icon: '📖', sub: 'Lactancia, sueño, alimentación' },
  { key: 'acompanamiento',  label: 'Acompañamiento Emocional',  icon: '🤝', sub: 'Recomendaciones personalizadas' },
  { key: 'sugerencias',     label: 'Desarrollo del Bebé',       icon: '🌱', sub: 'Sugerencias según la etapa' },
  { key: 'comunidad',       label: 'Comunidad',                 icon: '👩‍👩‍👧', sub: 'Comparte con otras mamás' },
  { key: 'galeria', label: 'Galería de Recuerdos', icon: '📸', sub: 'Fotos especiales de tu bebé' },
  { key: 'especialistas',   label: 'Especialistas',             icon: '👩‍⚕️', sub: 'Acceso prioritario Premium', premium: true },
  { key: 'premium',         label: 'Plan Premium',              icon: '⭐', sub: 'Contenido y funciones exclusivas', isPremiumCta: true },
  ];

const DESKTOP_VISIBLE = ['index', 'guias', 'citas', 'bienestar', 'vacunas', 'biblioteca'];

function useScreenWidth() {
  const [width, setWidth] = useState(Dimensions.get('window').width);
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width);
    });
    return () => sub?.remove();
  }, []);
  return width;
}

function MomlyLogo({ size = 'md' }) {
  return (
    <Image 
      source={require('../assets/images/logo.png')}
      style={{ width: 100, height: 40 }}
      resizeMode="contain"
    />
  );
}

function DesktopNav({ activeRoute, onNavigate, user, onLogout }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const visibleItems = NAV_ITEMS.filter(i => DESKTOP_VISIBLE.includes(i.key));
  const moreItems    = NAV_ITEMS.filter(i => !DESKTOP_VISIBLE.includes(i.key) && !i.isPremiumCta);

  return (
    <View style={styles.desktopHeader}>
      <View style={styles.desktopInner}>
        <MomlyLogo />
        <View style={styles.desktopLinks}>
          {visibleItems.map(item => (
            <TouchableOpacity
              key={item.key}
              style={[styles.desktopLink, activeRoute === item.key && styles.desktopLinkActive]}
              onPress={() => onNavigate(item.key)}
            >
              <Text style={[styles.desktopLinkText, activeRoute === item.key && styles.desktopLinkTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
          <View>
            <TouchableOpacity
              style={[styles.desktopLink, moreOpen && styles.desktopLinkActive]}
              onPress={() => setMoreOpen(v => !v)}
            >
              <Text style={[styles.desktopLinkText, moreOpen && styles.desktopLinkTextActive]}>
                Más {moreOpen ? '▴' : '▾'}
              </Text>
            </TouchableOpacity>
            {moreOpen && (
              <View style={styles.dropdown}>
                {moreItems.map(item => (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.dropdownItem}
                    onPress={() => { onNavigate(item.key); setMoreOpen(false); }}
                  >
                    <Text style={styles.dropdownIcon}>{item.icon}</Text>
                    <View>
                      <Text style={styles.dropdownLabel}>{item.label}</Text>
                      {item.sub && <Text style={styles.dropdownSub}>{item.sub}</Text>}
                    </View>
                    {item.premium && (
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumBadgeText}>Premium</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={styles.desktopActions}>
          <TouchableOpacity style={styles.upgradeBtn} onPress={() => onNavigate('premium')}>
            <Text style={styles.upgradeBtnText}>⭐ Premium</Text>
          </TouchableOpacity>
          <UserMenu user={user} onLogout={onLogout} onNavigate={onNavigate} />
        </View>
      </View>
    </View>
  );
}

function UserMenu({ user, onLogout, onNavigate }) {
  const [open, setOpen] = useState(false);
  const initial = user?.name?.[0]?.toUpperCase() ?? 'U';
  return (
    <View>
      <TouchableOpacity style={styles.avatarBtn} onPress={() => setOpen(v => !v)}>
        <Text style={styles.avatarText}>{initial}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.userDropdown}>
          <View style={styles.userDropdownHeader}>
            <View style={styles.userDropdownAvatar}>
              <Text style={styles.userDropdownAvatarText}>{initial}</Text>
            </View>
            <View>
              <Text style={styles.userDropdownName}>{user?.name ?? 'Usuario'}</Text>
              <Text style={styles.userDropdownEmail}>{user?.correo ?? user?.email ?? ''}</Text>
            </View>
          </View>
          <View style={styles.dropdownDivider} />
          <View style={styles.dropdownDivider} />
          <TouchableOpacity style={[styles.dropdownItem, styles.logoutItem]} onPress={onLogout}>
            <Text style={styles.dropdownIcon}>🚪</Text>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function MobileNav({ activeRoute, onNavigate, user, onLogout }) {
  const [open, setOpen]  = useState(false);
  const slideAnim        = useState(new Animated.Value(280))[0];
  const overlayAnim      = useState(new Animated.Value(0))[0];

  const openMenu = useCallback(() => {
    setOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim,   { toValue: 0,   useNativeDriver: true, tension: 65, friction: 11 }),
      Animated.timing(overlayAnim, { toValue: 1,   useNativeDriver: true, duration: 220 }),
    ]).start();
  }, [slideAnim, overlayAnim]);

  const closeMenu = useCallback(() => {
    Animated.parallel([
      Animated.spring(slideAnim,   { toValue: 280, useNativeDriver: true, tension: 65, friction: 11 }),
      Animated.timing(overlayAnim, { toValue: 0,   useNativeDriver: true, duration: 200 }),
    ]).start(() => setOpen(false));
  }, [slideAnim, overlayAnim]);

  const navigate = (key) => { closeMenu(); onNavigate(key); };
  const initial  = user?.name?.[0]?.toUpperCase() ?? 'U';

  return (
    <View>
      <View style={styles.mobileHeader}>
        <MomlyLogo size="sm" />
        <View style={styles.mobileActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={open ? closeMenu : openMenu}>
            <View style={styles.hamLines}>
              <View style={[styles.hamLine, styles.hamLine1]} />
              <View style={[styles.hamLine, styles.hamLine2]} />
              <View style={[styles.hamLine, styles.hamLine3]} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {open && (
        <>
          <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} pointerEvents="auto">
            <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
          </Animated.View>
          <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.sidebarHeader}>
              <View style={styles.sidebarAvatar}>
                <Text style={styles.sidebarAvatarText}>{initial}</Text>
              </View>
              <View>
                <Text style={styles.sidebarName}>{user?.name ?? 'Usuario'}</Text>
                <Text style={styles.sidebarEmail}>{user?.correo ?? user?.email ?? ''}</Text>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>✨ Plan Free</Text>
                </View>
              </View>
            </View>
            <ScrollView style={styles.sidebarScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>PRINCIPAL</Text>
              {NAV_ITEMS.filter(i => !i.isPremiumCta).map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.sidebarItem, activeRoute === item.key && styles.sidebarItemActive]}
                  onPress={() => navigate(item.key)}
                >
                  <View style={[styles.sidebarIconWrap, activeRoute === item.key && styles.sidebarIconWrapActive]}>
                    <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sidebarItemLabel, activeRoute === item.key && styles.sidebarItemLabelActive]}>
                      {item.label}
                    </Text>
                    {item.sub && <Text style={styles.sidebarItemSub} numberOfLines={1}>{item.sub}</Text>}
                  </View>
                  {item.premium && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumBadgeText}>Premium</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.premiumCta} onPress={() => navigate('premium')}>
                <Text style={styles.premiumCtaText}>⭐ Mejorar a Premium</Text>
              </TouchableOpacity>
              <View style={{ height: 16 }} />
            </ScrollView>
            <View style={styles.sidebarFooter}>
              <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                <Text style={{ fontSize: 16 }}>🚪</Text>
                <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}
    </View>
  );
}

export default function MomlyNavigation({ user, onLogout, activeRoute = 'index', onNavigate = () => {} }) {
  const width     = useScreenWidth();
  const isDesktop = width >= BREAKPOINT;
  return isDesktop
    ? <DesktopNav  activeRoute={activeRoute} onNavigate={onNavigate} user={user} onLogout={onLogout} />
    : <MobileNav   activeRoute={activeRoute} onNavigate={onNavigate} user={user} onLogout={onLogout} />;
}

const styles = StyleSheet.create({
  logoName:  { fontWeight: '800', color: COLORS.primary, letterSpacing: 2 },
  logoHeart: { color: '#f7a4bc' },
  logoTag:   { color: COLORS.textPink, fontWeight: '600', letterSpacing: 0.5 },

  desktopHeader: { backgroundColor: '#FFF1E6', borderBottomWidth: 1, borderBottomColor: COLORS.border, zIndex: 100 },
  desktopInner:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 64 },
  desktopLinks:  { flexDirection: 'row', alignItems: 'center', gap: 2 },
  desktopLink:   { paddingVertical: 7, paddingHorizontal: 13, borderRadius: 20 },
  desktopLinkActive:     { backgroundColor: COLORS.primaryLight },
  desktopLinkText:       { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  desktopLinkTextActive: { color: COLORS.primary },
  desktopActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  upgradeBtn:     { backgroundColor: COLORS.primary, paddingVertical: 7, paddingHorizontal: 16, borderRadius: 20 },
  upgradeBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },

  avatarBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border },
  avatarText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },

  dropdown: {
    position: 'absolute', top: 38, left: 0, width: 260,
    backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 6,
    ...Platform.select({ web: { boxShadow: '0 8px 24px rgba(232,51,109,0.10)' }, default: { elevation: 6 } }),
    zIndex: 200,
  },
  userDropdown: {
    position: 'absolute', top: 42, right: 0, width: 230,
    backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 6,
    ...Platform.select({ web: { boxShadow: '0 8px 24px rgba(232,51,109,0.10)' }, default: { elevation: 6 } }),
    zIndex: 200,
  },
  userDropdownHeader:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  userDropdownAvatar:     { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  userDropdownAvatarText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  userDropdownName:       { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  userDropdownEmail:      { fontSize: 12, color: COLORS.textMuted },
  dropdownDivider:        { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  dropdownItem:           { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, paddingHorizontal: 14 },
  dropdownIcon:           { fontSize: 15 },
  dropdownLabel:          { fontSize: 13, fontWeight: '600', color: COLORS.textDark },
  dropdownSub:            { fontSize: 11, color: COLORS.textMuted },
  logoutItem:             { },
  logoutText:             { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  premiumBadge:     { backgroundColor: '#fff8e6', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, marginLeft: 'auto' },
  premiumBadgeText: { fontSize: 10, fontWeight: '700', color: '#b8860b' },

  mobileHeader:  { backgroundColor: '#FFF1E6', borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, height: 58, zIndex: 100 },
  mobileActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryBg, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  hamLines:      { gap: 4, alignItems: 'flex-end' },
  hamLine:       { height: 2, backgroundColor: COLORS.primary, borderRadius: 2 },
  hamLine1:      { width: 16 },
  hamLine2:      { width: 12 },
  hamLine3:      { width: 16 },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(232,51,109,0.08)', zIndex: 150 },

  sidebar: {
    position: 'absolute', top: 0, right: 0, width: 280, height: '100%',
    backgroundColor: COLORS.white, borderLeftWidth: 1, borderLeftColor: COLORS.border, zIndex: 200,
    ...Platform.select({ web: { boxShadow: '-4px 0 20px rgba(232,51,109,0.08)' }, default: { elevation: 8 } }),
  },
  sidebarHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.primaryBg },
  sidebarAvatar:     { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sidebarAvatarText: { color: COLORS.white, fontWeight: '800', fontSize: 17 },
  sidebarName:       { fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  sidebarEmail:      { fontSize: 11, color: COLORS.textMuted },
  planBadge:         { marginTop: 3, backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  planBadgeText:     { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  sidebarScroll:     { flex: 1 },
  sectionLabel:      { fontSize: 10, fontWeight: '700', color: '#d4a0b0', letterSpacing: 1.2, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 4 },
  sidebarItem:            { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 18 },
  sidebarItemActive:      { backgroundColor: COLORS.primaryLight },
  sidebarIconWrap:        { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.primaryBg, alignItems: 'center', justifyContent: 'center' },
  sidebarIconWrapActive:  { backgroundColor: COLORS.border },
  sidebarItemLabel:       { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  sidebarItemLabelActive: { color: COLORS.primary },
  sidebarItemSub:         { fontSize: 11, color: COLORS.textMuted },
  premiumCta:     { margin: 16, backgroundColor: COLORS.primary, borderRadius: 22, paddingVertical: 11, alignItems: 'center' },
  premiumCtaText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  sidebarFooter:  { borderTopWidth: 1, borderTopColor: COLORS.border, padding: 12 },
  logoutBtn:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  logoutBtnText:  { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});