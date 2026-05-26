import React from 'react';
import { Trash, TickCircle, CloseCircle } from 'iconsax-react';
import { useOrganisationsContext } from '../context/OrganisationsContext';

const DeleteOrganisationModal = () => {
  const {
    deleteModal,
    setDeleteModal,
    deleteClosing,
    isDeleting,
    deleteAlert,
    closeDeleteModal,
    confirmDelete,
  } = useOrganisationsContext();

  if (!deleteModal.open) return null;

  return (
    <div
      className={`orgs-modal-overlay ${deleteClosing ? 'closing' : ''}`}
      onClick={() => !(isDeleting || deleteAlert.type === 'success') && closeDeleteModal()}
    >
      <div className={`orgs-modal orgs-confirm-modal ${deleteClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="orgs-confirm-body">
          <div className="orgs-confirm-icon">
            <Trash size={30} variant="Bold" color="var(--color-danger)" />
          </div>
          <h2 className="orgs-confirm-title">Supprimer l'organisation</h2>
          <p className="orgs-confirm-text" style={{ marginBottom: deleteAlert.message ? '10px' : '20px' }}>
            Vous êtes sur le point de supprimer <strong>"{deleteModal.org?.name}"</strong>. Cette action est <strong>irréversible</strong>.
          </p>

          {deleteAlert.message && (
            <div className={`orgs-bootstrap-alert alert-${deleteAlert.type}`} style={{ width: '100%', boxSizing: 'border-box' }}>
              {deleteAlert.type === 'success' ? <TickCircle size={18} variant="Bold" /> : <CloseCircle size={18} variant="Bold" />}
              <span>{deleteAlert.message}</span>
            </div>
          )}

          <div className="orgs-confirm-actions">
            <button
              className="orgs-btn-cancel"
              onClick={closeDeleteModal}
              disabled={isDeleting || deleteAlert.type === 'success'}
            >
              Annuler
            </button>
            <button
              className="orgs-btn-confirm-delete"
              onClick={confirmDelete}
              disabled={isDeleting || deleteAlert.type === 'success'}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isDeleting && <span className="orgs-spinner" />}
              {isDeleting
                ? 'Suppression...'
                : (deleteAlert.type === 'success' ? 'Succès !' : 'Supprimer')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrganisationModal;
