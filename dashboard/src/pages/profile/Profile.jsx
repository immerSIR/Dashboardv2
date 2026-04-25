import React, { useRef, useState } from 'react';
import {
  User,
  Sms,
  Call,
  Location,
  Calendar,
  Edit2,
  Camera,
  Lock1,
  Eye,
  EyeSlash,
  Buildings2,
  Briefcase,
  Global,
  TickCircle,
  CloseCircle,
  Setting2,
  ArrowRight2
} from 'iconsax-react';
import { Header, Sidebar } from '../../components/layout';
import './profile.css';

const TABS = [
  { id: 'personal', label: 'Informations personnelles', icon: User },
  { id: 'organisation', label: 'Organisation', icon: Buildings2 },
  { id: 'security', label: 'Sécurité', icon: Lock1 },
  { id: 'preferences', label: 'Préférences', icon: Setting2 }
];

const initialProfile = {
  firstName: 'Aïssata',
  lastName: 'Diallo',
  email: 'aissata.diallo@mapaction.org',
  phone: '+223 76 12 34 56',
  address: 'Hamdallaye ACI 2000, Rue 392',
  city: 'Bamako',
  country: 'Mali',
  birthDate: '1992-06-14',
  bio:
    "Coordinatrice terrain passionnée par l'humanitaire et l'environnement. 8 ans d'expérience en zone rurale au Mali.",
  avatar: null,
  organisation: 'Map Action Mali',
  role: 'Coordinatrice projets',
  department: 'Opérations terrain',
  joinedAt: '2021-09-12',
  language: 'Français',
  notifications: {
    email: true,
    push: true,
    sms: false,
    weekly: true
  }
};

export const Profile = ({ onLogout, user, activeNav, onNavChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [savedFlash, setSavedFlash] = useState(false);
  const fileInputRef = useRef(null);

  // Password
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({
    current: false,
    next: false,
    confirm: false
  });
  const [pwdMessage, setPwdMessage] = useState(null);

  const handleField = (key, value) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleNotifToggle = (key) =>
    setDraft((d) => ({
      ...d,
      notifications: { ...d.notifications, [key]: !d.notifications[key] }
    }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setDraft((d) => ({ ...d, avatar: ev.target?.result }));
    reader.readAsDataURL(file);
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e?.preventDefault?.();
    setProfile(draft);
    setIsEditing(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2400);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (pwd.next.length < 8) {
      setPwdMessage({
        type: 'error',
        text: 'Le mot de passe doit contenir au moins 8 caractères.'
      });
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setPwdMessage({
        type: 'error',
        text: 'Les mots de passe ne correspondent pas.'
      });
      return;
    }
    setPwdMessage({
      type: 'success',
      text: 'Mot de passe mis à jour avec succès.'
    });
    setPwd({ current: '', next: '', confirm: '' });
    setTimeout(() => setPwdMessage(null), 3000);
  };

  const initials = `${profile.firstName?.[0] ?? ''}${
    profile.lastName?.[0] ?? ''
  }`.toUpperCase();

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="profile-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeNav}
        onItemClick={onNavChange}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className={`profile-main ${
          sidebarCollapsed ? 'sidebar-collapsed' : ''
        }`}
      >
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          onLogout={onLogout}
          onNavChange={onNavChange}
        />

        <main className="profile-content">
          <div className="profile-page">
            {/* Page header */}
            <div className="profile-page-header">
              <div>
                <h1 className="profile-title">Mon profil</h1>
                <p className="profile-subtitle">
                  Gérez vos informations personnelles, votre organisation et la
                  sécurité de votre compte.
                </p>
              </div>
              {savedFlash && (
                <div className="profile-flash">
                  <TickCircle size={18} variant="Bold" color="#22C55E" />
                  Modifications enregistrées
                </div>
              )}
            </div>

            {/* Banner card */}
            <section className="profile-banner">
              <div className="profile-banner-cover" />
              <div className="profile-banner-content">
                <div className="profile-avatar-wrap">
                  <div className="profile-avatar-large">
                    {draft.avatar ? (
                      <img src={draft.avatar} alt="Avatar" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="profile-avatar-edit"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Changer la photo de profil"
                  >
                    <Camera size={16} variant="Bold" color="#FFFFFF" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="profile-banner-info">
                  <h2 className="profile-banner-name">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="profile-banner-role">
                    {profile.role} · {profile.organisation}
                  </p>
                  <div className="profile-banner-meta">
                    <span>
                      <Sms size={14} variant="Bold" color="#6C7278" />
                      {profile.email}
                    </span>
                    <span>
                      <Location size={14} variant="Bold" color="#6C7278" />
                      {profile.city}, {profile.country}
                    </span>
                    <span>
                      <Calendar size={14} variant="Bold" color="#6C7278" />
                      Membre depuis {formatDate(profile.joinedAt)}
                    </span>
                  </div>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    className="profile-btn profile-btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 size={16} variant="Bold" color="#FFFFFF" />
                    Modifier
                  </button>
                ) : (
                  <div className="profile-banner-actions">
                    <button
                      type="button"
                      className="profile-btn profile-btn-ghost"
                      onClick={handleCancel}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="profile-btn profile-btn-primary"
                      onClick={handleSave}
                    >
                      <TickCircle
                        size={16}
                        variant="Bold"
                        color="#FFFFFF"
                      />
                      Enregistrer
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Tabs + content */}
            <div className="profile-tabs-layout">
              <aside className="profile-tabs">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`profile-tab ${
                        activeTab === t.id ? 'is-active' : ''
                      }`}
                      onClick={() => setActiveTab(t.id)}
                    >
                      <Icon size={18} variant="Bold" color="currentColor" />
                      <span>{t.label}</span>
                      <ArrowRight2
                        size={14}
                        variant="Linear"
                        color="currentColor"
                      />
                    </button>
                  );
                })}
              </aside>

              <section className="profile-tab-content">
                {/* PERSONAL */}
                {activeTab === 'personal' && (
                  <form
                    className="profile-form"
                    onSubmit={handleSave}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      e.target.tagName !== 'TEXTAREA' &&
                      e.preventDefault()
                    }
                  >
                    <h3 className="profile-section-title">
                      Informations personnelles
                    </h3>

                    <div className="profile-grid">
                      <div className="profile-field">
                        <label htmlFor="firstName">Prénom</label>
                        <input
                          id="firstName"
                          type="text"
                          value={draft.firstName}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleField('firstName', e.target.value)
                          }
                        />
                      </div>
                      <div className="profile-field">
                        <label htmlFor="lastName">Nom</label>
                        <input
                          id="lastName"
                          type="text"
                          value={draft.lastName}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleField('lastName', e.target.value)
                          }
                        />
                      </div>
                      <div className="profile-field">
                        <label htmlFor="email">
                          <Sms size={14} variant="Bold" color="#6C7278" />
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={draft.email}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleField('email', e.target.value)
                          }
                        />
                      </div>
                      <div className="profile-field">
                        <label htmlFor="phone">
                          <Call size={14} variant="Bold" color="#6C7278" />
                          Téléphone
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={draft.phone}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleField('phone', e.target.value)
                          }
                        />
                      </div>
                      <div className="profile-field profile-field-full">
                        <label htmlFor="address">
                          <Location size={14} variant="Bold" color="#6C7278" />
                          Adresse
                        </label>
                        <input
                          id="address"
                          type="text"
                          value={draft.address}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleField('address', e.target.value)
                          }
                        />
                      </div>
                      <div className="profile-field">
                        <label htmlFor="city">Ville</label>
                        <input
                          id="city"
                          type="text"
                          value={draft.city}
                          disabled={!isEditing}
                          onChange={(e) => handleField('city', e.target.value)}
                        />
                      </div>
                      <div className="profile-field">
                        <label htmlFor="country">Pays</label>
                        <input
                          id="country"
                          type="text"
                          value={draft.country}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleField('country', e.target.value)
                          }
                        />
                      </div>
                      <div className="profile-field">
                        <label htmlFor="birthDate">
                          <Calendar size={14} variant="Bold" color="#6C7278" />
                          Date de naissance
                        </label>
                        <input
                          id="birthDate"
                          type="date"
                          value={draft.birthDate}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleField('birthDate', e.target.value)
                          }
                        />
                      </div>
                      <div className="profile-field profile-field-full">
                        <label htmlFor="bio">À propos de moi</label>
                        <textarea
                          id="bio"
                          rows={4}
                          value={draft.bio}
                          disabled={!isEditing}
                          onChange={(e) => handleField('bio', e.target.value)}
                          placeholder="Présentez-vous en quelques lignes…"
                        />
                      </div>
                    </div>
                  </form>
                )}

                {/* ORGANISATION */}
                {activeTab === 'organisation' && (
                  <form className="profile-form" onSubmit={handleSave}>
                    <h3 className="profile-section-title">Organisation</h3>
                    <div className="profile-grid">
                      <div className="profile-field profile-field-full">
                        <label htmlFor="organisation">
                          <Buildings2
                            size={14}
                            variant="Bold"
                            color="#6C7278"
                          />
                          Organisation
                        </label>
                        <input
                          id="organisation"
                          type="text"
                          value={draft.organisation}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleField('organisation', e.target.value)
                          }
                        />
                      </div>
                      <div className="profile-field">
                        <label htmlFor="role">
                          <Briefcase
                            size={14}
                            variant="Bold"
                            color="#6C7278"
                          />
                          Poste
                        </label>
                        <input
                          id="role"
                          type="text"
                          value={draft.role}
                          disabled={!isEditing}
                          onChange={(e) => handleField('role', e.target.value)}
                        />
                      </div>
                      <div className="profile-field">
                        <label htmlFor="department">Département</label>
                        <input
                          id="department"
                          type="text"
                          value={draft.department}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleField('department', e.target.value)
                          }
                        />
                      </div>
                      <div className="profile-field">
                        <label htmlFor="joinedAt">Date d'arrivée</label>
                        <input
                          id="joinedAt"
                          type="date"
                          value={draft.joinedAt}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleField('joinedAt', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </form>
                )}

                {/* SECURITY */}
                {activeTab === 'security' && (
                  <form
                    className="profile-form"
                    onSubmit={handleChangePassword}
                  >
                    <h3 className="profile-section-title">
                      Changer le mot de passe
                    </h3>
                    <p className="profile-section-hint">
                      Utilisez au moins 8 caractères avec un mélange de
                      lettres, chiffres et symboles.
                    </p>

                    {pwdMessage && (
                      <div
                        className={`profile-alert ${
                          pwdMessage.type === 'success'
                            ? 'is-success'
                            : 'is-error'
                        }`}
                      >
                        {pwdMessage.type === 'success' ? (
                          <TickCircle
                            size={18}
                            variant="Bold"
                            color="#22C55E"
                          />
                        ) : (
                          <CloseCircle
                            size={18}
                            variant="Bold"
                            color="#EF4444"
                          />
                        )}
                        {pwdMessage.text}
                      </div>
                    )}

                    <div className="profile-grid">
                      {[
                        { id: 'current', label: 'Mot de passe actuel' },
                        { id: 'next', label: 'Nouveau mot de passe' },
                        { id: 'confirm', label: 'Confirmer le mot de passe' }
                      ].map((p) => (
                        <div
                          key={p.id}
                          className="profile-field profile-field-full"
                        >
                          <label htmlFor={`pwd-${p.id}`}>{p.label}</label>
                          <div className="profile-password-wrap">
                            <input
                              id={`pwd-${p.id}`}
                              type={showPwd[p.id] ? 'text' : 'password'}
                              value={pwd[p.id]}
                              onChange={(e) =>
                                setPwd((s) => ({
                                  ...s,
                                  [p.id]: e.target.value
                                }))
                              }
                              placeholder="••••••••"
                              required
                            />
                            <button
                              type="button"
                              className="profile-password-toggle"
                              onClick={() =>
                                setShowPwd((s) => ({
                                  ...s,
                                  [p.id]: !s[p.id]
                                }))
                              }
                              aria-label={
                                showPwd[p.id] ? 'Masquer' : 'Afficher'
                              }
                            >
                              {showPwd[p.id] ? (
                                <EyeSlash
                                  size={18}
                                  variant="Linear"
                                  color="#6C7278"
                                />
                              ) : (
                                <Eye
                                  size={18}
                                  variant="Linear"
                                  color="#6C7278"
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="profile-form-actions">
                      <button
                        type="submit"
                        className="profile-btn profile-btn-primary"
                      >
                        <Lock1 size={16} variant="Bold" color="#FFFFFF" />
                        Mettre à jour le mot de passe
                      </button>
                    </div>
                  </form>
                )}

                {/* PREFERENCES */}
                {activeTab === 'preferences' && (
                  <div className="profile-form">
                    <h3 className="profile-section-title">Préférences</h3>

                    <div className="profile-field profile-field-full">
                      <label htmlFor="lang">
                        <Global size={14} variant="Bold" color="#6C7278" />
                        Langue de l'interface
                      </label>
                      <select
                        id="lang"
                        value={draft.language}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleField('language', e.target.value)
                        }
                      >
                        <option value="Français">Français</option>
                        <option value="Bambara">Bambara</option>
                        <option value="Fulfulde">Fulfulde</option>
                        <option value="English">English</option>
                      </select>
                    </div>

                    <h4 className="profile-subsection-title">
                      Notifications
                    </h4>
                    <div className="profile-toggle-list">
                      {[
                        {
                          key: 'email',
                          label: 'Notifications par email',
                          hint: 'Recevoir les alertes importantes par email.'
                        },
                        {
                          key: 'push',
                          label: 'Notifications push',
                          hint: 'Recevoir des notifications dans le navigateur.'
                        },
                        {
                          key: 'sms',
                          label: 'Notifications SMS',
                          hint: 'Recevoir les alertes critiques par SMS.'
                        },
                        {
                          key: 'weekly',
                          label: 'Récapitulatif hebdomadaire',
                          hint: 'Un résumé chaque lundi matin.'
                        }
                      ].map((n) => (
                        <div key={n.key} className="profile-toggle-row">
                          <div>
                            <div className="profile-toggle-label">
                              {n.label}
                            </div>
                            <div className="profile-toggle-hint">{n.hint}</div>
                          </div>
                          <button
                            type="button"
                            className={`profile-toggle ${
                              draft.notifications[n.key] ? 'is-on' : ''
                            }`}
                            onClick={() =>
                              isEditing && handleNotifToggle(n.key)
                            }
                            disabled={!isEditing}
                            role="switch"
                            aria-checked={draft.notifications[n.key]}
                          >
                            <span className="profile-toggle-thumb" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
