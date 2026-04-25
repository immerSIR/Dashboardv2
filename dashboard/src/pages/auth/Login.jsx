import { useState } from 'react';
import { Sms, Eye, EyeSlash } from 'iconsax-react';
import logoMapAction from '../../assets/logo.svg';
import loginBg from '../../assets/login_bg.png';
import './login.css';

export const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin && onLogin({ email, password, rememberMe });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="login-split">
      {/* Colonne gauche - Formulaire */}
      <div className="login-side">
       

        <div className="login-content">
                     <img src={logoMapAction} alt="Map Action" className="login-brand-logo" />

          <div className="login-intro">
            <p className="login-kicker">Bienvenue</p>
            <h1 className="login-heading">Connectez-vous à Map Action</h1>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="field">
              <label className="field-label">E-mail</label>
              <div className="field-input">
                <input
                  type="email"
                  placeholder="exemple@domaine.ml"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Sms size={20} variant="Linear" color="#6C7278" />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Mot de passe</label>
              <div className="field-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="field-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <EyeSlash size={20} variant="Linear" color="#6C7278" />
                  ) : (
                    <Eye size={20} variant="Linear" color="#6C7278" />
                  )}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Se souvenir de moi</span>
              </label>
              <a href="#" className="forgot-password">Mot de passe oublié ?</a>
            </div>

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>

      {/* Colonne droite - Image */}
      <div
        className="login-hero"
        style={{ backgroundImage: `url(${loginBg})` }}
        aria-hidden="true"
      />
    </div>
  );
};

export default Login;
