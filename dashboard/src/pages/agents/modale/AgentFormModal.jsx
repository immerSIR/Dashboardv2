import React, { useEffect, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eye, EyeSlash, Magicpen, Copy, TickCircle, CloseCircle } from 'iconsax-react';
import { ROLES, AVATAR_COLORS } from '../data/agents';
import { useAgentsContext } from './AgentsModalContext';
import {
  createAgentSchema,
  editAgentSchema,
  generatePasswordForRole,
} from './agentSchemas';
import {
  createOrganisationAgentService,
  updateOrganisationMemberService,
  addOrganisationStaffMemberService,
} from '../service/members_service';
import { authService } from '../../auth/services/authService';

// ── Helpers ───────────────────────────────────────────────────────
const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');

// ── Composant ────────────────────────────────────────────────────
export const AgentFormModal = () => {
  const currentUser = authService.getCurrentUser();
  const rawOrg = currentUser?.organisation;
  const userOrgName = currentUser?.organisation_name || (rawOrg && typeof rawOrg === 'object' ? rawOrg.name : 'Mon Organisation');

  const {
    formModal,
 
    setShowPassword,
    modalAlert,
    setModalAlert,
    formAnimating,
    isSubmitting,
    setIsSubmitting,
    closeFormModal,
    mutateAgents,
    organisationsList,
  } = useAgentsContext();

  // Trouver l'organisation correspondante dans la liste globale pour extraire son ID exact
  const matchedOrg = (organisationsList || []).find(
    (o) => o.name?.trim().toLowerCase() === userOrgName?.trim().toLowerCase()
  );

  const userOrgId = matchedOrg
    ? matchedOrg.id
    : (rawOrg && typeof rawOrg === 'object' ? rawOrg.id : (rawOrg || sessionStorage.getItem('organisation') || ''));

  const isCreate = formModal.mode === 'create';
  const schema = isCreate ? createAgentSchema : editAgentSchema;

  const alertRef = useRef(null);

  // Auto-scroll vers l'alerte quand elle s'affiche
  useEffect(() => {
    if (modalAlert.message && alertRef.current) {
      alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [modalAlert.message]);

  // ── react-hook-form ──────────────────────────────────────────
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: isCreate
      ? {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        role: '',
        organisationId: userOrgId || '',
        status: 'active',
        avatarColor: '#3AA2DD',
      }
      : {
        firstName: formModal.agent?.firstName || '',
        lastName: formModal.agent?.lastName || '',
        email: formModal.agent?.email || '',
        phone: formModal.agent?.phone || '',
        address: formModal.agent?.address || '',
        password: '',
        role: formModal.agent?.role || '',
        organisationId: formModal.agent?.organisationId || '',
        status: formModal.agent?.status || 'active',
        avatarColor: formModal.agent?.avatarColor || '#3AA2DD',
      },
  });

  // Sync valeurs initiales quand le mode change ou que le modal s'ouvre/ferme
  useEffect(() => {
    if (!formModal.open) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        role: '',
        organisationId: userOrgId || '',
        status: 'active',
        avatarColor: '#3AA2DD',
      });
      setShowPassword(false);
      return;
    }

    if (isCreate) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        role: '',
        organisationId: userOrgId || '',
        status: 'active',
        avatarColor: '#3AA2DD',
      });
      setShowPassword(false);
    } else if (formModal.agent) {
      reset({
        firstName: formModal.agent.firstName || '',
        lastName: formModal.agent.lastName || '',
        email: formModal.agent.email || '',
        phone: formModal.agent.phone || '',
        address: formModal.agent.address || '',
        password: '',
        role: formModal.agent.role || '',
        organisationId: formModal.agent.organisationId || '',
        status: formModal.agent.status || 'active',
        avatarColor: formModal.agent.avatarColor || '#3AA2DD',
      });
      setShowPassword(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formModal.open, formModal.mode, formModal.agent?.id, isCreate, userOrgId]);

  // Valeurs observées
  const watchedFirstName = watch('firstName', '');
  const watchedLastName = watch('lastName', '');
  const watchedAvatarColor = watch('avatarColor', '#3AA2DD');
  const watchedRole = watch('role', '');
  const watchedPassword = watch('password', '');

  // Étiquette du rôle actuel
  const currentRoleConfig = ROLES.find((r) => r.id === watchedRole);

  // ── Copier dans le presse-papier ─────────────────────
  const [copied, setCopied] = React.useState(false);
  const copyToClipboard = useCallback(() => {
    if (!watchedPassword) return;
    navigator.clipboard.writeText(watchedPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [watchedPassword]);


  // En mode création : auto-générer quand le rôle change
  useEffect(() => {
    if (isCreate && watchedRole) {
      const pwd = generatePasswordForRole(watchedRole);
      setValue('password', pwd, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedRole, isCreate]);

  if (!formModal.open) return null;

  // ── Soumission ───────────────────────────────────────
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setModalAlert({ type: null, message: null });

    try {
      const orgRole =
        data.role === 'admin'
          ? 'org_admin'
          : data.role === 'terrain'
            ? 'field_agent'
            : 'bureau_agent';

      if (isCreate) {
        const payload = {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
          // password: data.password,
          org_role: orgRole,
        };


        if (data.role === 'terrain') {
          await createOrganisationAgentService(data.organisationId, payload);
        } else {
          await addOrganisationStaffMemberService(data.organisationId, payload);
        }

        setModalAlert({ type: 'success', message: 'Agent créé avec succès !' });
      } else {
        const payload = {
          org_role: orgRole,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone || '',
          address: data.address || '',
          status: data.status || 'active',
        };
        // Inclure le mot de passe seulement s'il a été saisi
        if (data.password) payload.password = data.password;
        await updateOrganisationMemberService(
          data.organisationId,
          formModal.agent.id,
          payload
        );
        setModalAlert({ type: 'success', message: 'Agent mis à jour avec succès !' });
      }

      mutateAgents();
      setTimeout(() => closeFormModal(), 2000);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        `Erreur lors de la ${isCreate ? 'création' : 'modification'}. Veuillez réessayer.`;
      setModalAlert({ type: 'danger', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Classes animation ────────────────────────────────
  const panelClass = [
    'am-offcanvas-panel',
    formAnimating === 'closing' ? 'am-offcanvas-panel--closing' : '',
    formAnimating === 'opening' ? 'am-offcanvas-panel--opening' : '',
  ].filter(Boolean).join(' ');

  const backdropClass = [
    'am-offcanvas-backdrop',
    formAnimating === 'closing' ? 'am-offcanvas-backdrop--closing' : '',
  ].filter(Boolean).join(' ');

  // ── Render ────────────────────────────────────────────
  return (
    <>
      <div className={backdropClass} onClick={closeFormModal} />

      <div
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-label={isCreate ? 'Nouvel agent' : "Modifier l'agent"}
      >
        {/* ── Header ──────────────────────────────────── */}
        <div className="am-offcanvas-header">
          <h5 className="am-offcanvas-title">
            {isCreate ? 'Nouvel agent' : "Modifier l'agent"}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={closeFormModal}
            disabled={isSubmitting || modalAlert.type === 'success'}
            aria-label="Fermer"
          />
        </div>

        {/* ── Body (formulaire) ────────────────────────── */}
        <form
          id="agent-form"
          className="am-offcanvas-body"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >

          {/* ── Avatar preview ───────────────────────── */}
          <div className="am-avatar-preview">
            <div
              className="am-avatar-circle"
              style={{ backgroundColor: watchedAvatarColor }}
              aria-hidden="true"
            >
              {getInitials(`${watchedFirstName} ${watchedLastName}`) || (isCreate ? '?' : getInitials(`${formModal.agent?.firstName || ''} ${formModal.agent?.lastName || ''}`))}
            </div>
            <div className="am-avatar-colors">
              <span className="am-avatar-colors__label">Couleur de l&apos;avatar</span>
              <Controller
                name="avatarColor"
                control={control}
                render={({ field }) => (
                  <div className="am-avatar-colors__swatches">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`am-swatch ${field.value === color ? 'am-swatch--active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => !isSubmitting && field.onChange(color)}
                        aria-label={`Couleur ${color}`}
                        aria-pressed={field.value === color}
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          {/* ── Champs ───────────────────────────────── */}
          <div className="am-form-grid">

            {/* Prénom */}
            <div className="am-field am-field--half">
              <label className="am-label" htmlFor="agent-firstName">
                Prénom <span className="am-label__required">*</span>
              </label>
              <input
                id="agent-firstName"
                type="text"
                className={`am-input ${errors.firstName ? 'am-input--error' : ''}`}
                placeholder="Ex. Amadou"
                disabled={isSubmitting}
                {...register('firstName')}
              />
              {errors.firstName && (
                <span className="am-field-error">{errors.firstName.message}</span>
              )}
            </div>

            {/* Nom */}
            <div className="am-field am-field--half">
              <label className="am-label" htmlFor="agent-lastName">
                Nom <span className="am-label__required">*</span>
              </label>
              <input
                id="agent-lastName"
                type="text"
                className={`am-input ${errors.lastName ? 'am-input--error' : ''}`}
                placeholder="Ex. Diallo"
                disabled={isSubmitting}
                {...register('lastName')}
              />
              {errors.lastName && (
                <span className="am-field-error">{errors.lastName.message}</span>
              )}
            </div>

            {/* Rôle */}
            <div className="am-field am-field--half">
              <label className="am-label" htmlFor="agent-role">
                Rôle <span className="am-label__required">*</span>
              </label>
              <select
                id="agent-role"
                className={`am-select ${errors.role ? 'am-input--error' : ''}`}
                disabled={isSubmitting}
                {...register('role')}
              >
                <option value="">Sélectionner un rôle…</option>
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id} title={r.description}>
                    {r.label}{r.mobileOnly ? ' (mobile)' : ''}
                  </option>
                ))}
              </select>
              {errors.role && (
                <span className="am-field-error">{errors.role.message}</span>
              )}
            </div>

            {/* Organisation */}
            <div className="am-field am-field--half">
              <label className="am-label" htmlFor="agent-org">
                Organisation
              </label>
              <input
                id="agent-org"
                type="text"
                className="am-input"
                value={isCreate ? userOrgName : (organisationsList.find(o => String(o.id) === String(formModal.agent?.organisationId))?.name || formModal.agent?.organisationName || '')}
                disabled
                style={{ backgroundColor: 'rgba(108, 114, 120, 0.08)', cursor: 'not-allowed' }}
                aria-readonly="true"
              />
              <input type="hidden" {...register('organisationId')} />
              {errors.organisationId && (
                <span className="am-field-error">{errors.organisationId.message}</span>
              )}
            </div>

            {/* Email */}
            <div className="am-field am-field--half">
              <label className="am-label" htmlFor="agent-email">
                Adresse e-mail
                {isCreate && <span className="am-label__required"> *</span>}
                {!isCreate && <span className="am-label__optional">(non modifiable)</span>}
              </label>
              <input
                id="agent-email"
                type="email"
                className={`am-input ${errors.email ? 'am-input--error' : ''}`}
                placeholder="agent@mapaction.org"
                disabled={isSubmitting || !isCreate}
                {...register('email')}
              />
              {errors.email && (
                <span className="am-field-error">{errors.email.message}</span>
              )}
            </div>

            {/* Téléphone */}
            <div className="am-field am-field--half">
              <label className="am-label" htmlFor="agent-phone">Téléphone</label>
              <input
                id="agent-phone"
                type="tel"
                className={`am-input ${errors.phone ? 'am-input--error' : ''}`}
                placeholder="+221771234567"
                disabled={isSubmitting}
                {...register('phone')}
              />
              {errors.phone && (
                <span className="am-field-error">{errors.phone.message}</span>
              )}
            </div>

            {/* Adresse */}
            <div className="am-field am-field--full">
              <label className="am-label" htmlFor="agent-address">Adresse</label>
              <input
                id="agent-address"
                type="text"
                className="am-input"
                placeholder="Dakar, Sénégal"
                disabled={isSubmitting}
                {...register('address')}
              />
            </div>



            {/* Statut */}
            <div className="am-field am-field--half">
              <label className="am-label" htmlFor="agent-status">Statut</label>
              <select
                id="agent-status"
                className="form-control"
                disabled={isSubmitting}
                {...register('status')}
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>

          </div>{/* end am-form-grid */}


          {/* Alert API (placée en bas du formulaire avec scroll automatique) */}
          {modalAlert.message && (
            <div
              ref={alertRef}
              className={`am-alert am-alert--${modalAlert.type}`}
              role="alert"
              style={{ marginTop: 'var(--spacing-4)' }}
            >
              {modalAlert.type === 'success' ? (
                <TickCircle size={18} variant="Bold" />
              ) : (
                <CloseCircle size={18} variant="Bold" />
              )}
              <span className="am-alert__message">{modalAlert.message}</span>
              <button
                type="button"
                className="am-alert__close"
                onClick={() => setModalAlert({ type: null, message: null })}
                aria-label="Fermer l'alerte"
              >×</button>
            </div>
          )}

        </form>

        {/* ── Footer ──────────────────────────────────────── */}
        <div className="am-offcanvas-footer">
          <button
            type="button"
            className="am-btn am-btn--secondary"
            onClick={closeFormModal}
            disabled={isSubmitting || modalAlert.type === 'success'}
          >
            Annuler
          </button>
          <button
            type="submit"
            form="agent-form"
            className="am-btn am-btn--primary"
            disabled={isSubmitting || modalAlert.type === 'success'}
          >
            {isSubmitting && <span className="am-spinner" aria-hidden="true" />}
            {isCreate ? "Créer l'agent" : 'Enregistrer'}
          </button>
        </div>
      </div>
    </>
  );
};

export default AgentFormModal;
