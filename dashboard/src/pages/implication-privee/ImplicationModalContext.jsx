import React, { createContext, useContext, useState } from 'react';

const ImplicationModalContext = createContext();

const MOCK_AGENTS = [
  { id: 1, fullName: "Abdoulaye Diop", email: "a.diop@map-action.com", role: "Terrain", orgName: "Croix-Rouge Sénégalaise", avatarColor: "#EF4444" },
  { id: 2, fullName: "Fatou Sow", email: "f.sow@map-action.com", role: "Bureau", orgName: "OCHA", avatarColor: "#3AA2DD" },
  { id: 3, fullName: "Moussa Ndiaye", email: "m.ndiaye@map-action.com", role: "Terrain", orgName: "PNUD Sénégal", avatarColor: "#22C55E" },
  { id: 4, fullName: "Aminata Touré", email: "a.toure@map-action.com", role: "Administrateur", orgName: "UNICEF", avatarColor: "#F59E0B" }
];

const INITIAL_ASSIGNMENTS = {
  101: [MOCK_AGENTS[0], MOCK_AGENTS[2]], // Abdoulaye Diop, Moussa Ndiaye
  102: [MOCK_AGENTS[1]], // Fatou Sow
  103: [MOCK_AGENTS[0], MOCK_AGENTS[1], MOCK_AGENTS[3]], // Abdoulaye, Fatou, Aminata
  104: [] // Aucun
};

export const ImplicationModalProvider = ({ children }) => {
  const [assignModal, setAssignModal] = useState({ open: false, incident: null });
  const [assignClosing, setAssignClosing] = useState(false);
  const [agentsModal, setAgentsModal] = useState({ open: false, incident: null });
  const [agentsClosing, setAgentsClosing] = useState(false);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);

  const openAssignModal = (incident) => {
    setAssignModal({ open: true, incident });
    setAssignClosing(false);
  };

  const closeAssignModal = () => {
    setAssignClosing(true);
    setTimeout(() => {
      setAssignModal({ open: false, incident: null });
      setAssignClosing(false);
    }, 280);
  };

  const openAgentsModal = (incident) => {
    setAgentsModal({ open: true, incident });
    setAgentsClosing(false);
  };

  const closeAgentsModal = () => {
    setAgentsClosing(true);
    setTimeout(() => {
      setAgentsModal({ open: false, incident: null });
      setAgentsClosing(false);
    }, 280);
  };

  const assignAgentsToIncident = (incidentId, selectedAgentsList) => {
    setAssignments((prev) => ({
      ...prev,
      [incidentId]: selectedAgentsList
    }));
  };

  return (
    <ImplicationModalContext.Provider
      value={{
        assignModal,
        setAssignModal,
        assignClosing,
        openAssignModal,
        closeAssignModal,
        agentsModal,
        setAgentsModal,
        agentsClosing,
        openAgentsModal,
        closeAgentsModal,
        assignments,
        assignAgentsToIncident,
        allMockAgents: MOCK_AGENTS
      }}
    >
      {children}
    </ImplicationModalContext.Provider>
  );
};

export const useImplicationModalContext = () => {
  const context = useContext(ImplicationModalContext);
  if (!context) {
    throw new Error('useImplicationModalContext must be used within an ImplicationModalProvider');
  }
  return context;
};

export default ImplicationModalContext;
