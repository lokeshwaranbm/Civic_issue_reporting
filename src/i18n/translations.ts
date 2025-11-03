export type Language = 'en' | 'hi' | 'ta' | 'te' | 'es' | 'fr';

export interface Translations {
  // Header
  appName: string;
  appSubtitle: string;
  profile: string;
  profileSettings: string;
  logout: string;
  
  // Navigation
  dashboard: string;
  allIssues: string;
  myIssues: string;
  supportedIssues: string;
  assignedIssues: string;
  trendingIssues: string;
  
  // Actions
  reportIssue: string;
  viewDetails: string;
  assignToStaff: string;
  updateStatus: string;
  addComment: string;
  support: string;
  upvote: string;
  
  // Status
  pending: string;
  inProgress: string;
  inspectionScheduled: string;
  resolved: string;
  rejected: string;
  
  // Priority
  normal: string;
  high: string;
  critical: string;
  
  // Categories
  road: string;
  water: string;
  electricity: string;
  streetlight: string;
  sanitation: string;
  drainage: string;
  other: string;
  
  // Issue Details
  location: string;
  reportedBy: string;
  reportedOn: string;
  assignedTo: string;
  department: string;
  description: string;
  comments: string;
  photos: string;
  
  // Forms
  title: string;
  category: string;
  selectCategory: string;
  enterDescription: string;
  capturePhoto: string;
  submit: string;
  cancel: string;
  save: string;
  
  // Settings
  languageSettings: string;
  selectLanguage: string;
  changeLanguage: string;
  
  // Stats
  total: string;
  active: string;
  overdue: string;
  avgResolutionTime: string;
  
  // Messages
  noIssuesFound: string;
  loading: string;
  success: string;
  error: string;
  
  // Roles
  citizen: string;
  staff: string;
  admin: string;
}

export const translations: Record<Language, Translations> = {
  // English
  en: {
    appName: 'Civic Reporter',
    appSubtitle: 'Municipal Issue Management',
    profile: 'Profile',
    profileSettings: 'Profile Settings',
    logout: 'Logout',
    
    dashboard: 'Dashboard',
    allIssues: 'All Issues',
    myIssues: 'My Issues',
    supportedIssues: 'Supported Issues',
    assignedIssues: 'Assigned Issues',
    trendingIssues: 'Trending Issues',
    
    reportIssue: 'Report Issue',
    viewDetails: 'View Details',
    assignToStaff: 'Assign to Staff',
    updateStatus: 'Update Status',
    addComment: 'Add Comment',
    support: 'Support',
    upvote: 'Upvote',
    
    pending: 'Pending',
    inProgress: 'In Progress',
    inspectionScheduled: 'Inspection Scheduled',
    resolved: 'Resolved',
    rejected: 'Rejected',
    
    normal: 'Normal',
    high: 'High',
    critical: 'Critical',
    
    road: 'Road',
    water: 'Water',
    electricity: 'Electricity',
    streetlight: 'Street Light',
    sanitation: 'Sanitation',
    drainage: 'Drainage',
    other: 'Other',
    
    location: 'Location',
    reportedBy: 'Reported By',
    reportedOn: 'Reported On',
    assignedTo: 'Assigned To',
    department: 'Department',
    description: 'Description',
    comments: 'Comments',
    photos: 'Photos',
    
    title: 'Title',
    category: 'Category',
    selectCategory: 'Select Category',
    enterDescription: 'Enter Description',
    capturePhoto: 'Capture Photo',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    
    languageSettings: 'Language Settings',
    selectLanguage: 'Select Language',
    changeLanguage: 'Change Language',
    
    total: 'Total',
    active: 'Active',
    overdue: 'Overdue',
    avgResolutionTime: 'Avg. Resolution Time',
    
    noIssuesFound: 'No issues found',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    
    citizen: 'Citizen',
    staff: 'Staff',
    admin: 'Admin',
  },
  
  // Hindi (हिन्दी)
  hi: {
    appName: 'नागरिक रिपोर्टर',
    appSubtitle: 'नगरपालिका समस्या प्रबंधन',
    profile: 'प्रोफ़ाइल',
    profileSettings: 'प्रोफ़ाइल सेटिंग्स',
    logout: 'लॉग आउट',
    
    dashboard: 'डैशबोर्ड',
    allIssues: 'सभी समस्याएं',
    myIssues: 'मेरी समस्याएं',
    supportedIssues: 'समर्थित समस्याएं',
    assignedIssues: 'सौंपी गई समस्याएं',
    trendingIssues: 'ट्रेंडिंग समस्याएं',
    
    reportIssue: 'समस्या रिपोर्ट करें',
    viewDetails: 'विवरण देखें',
    assignToStaff: 'स्टाफ को सौंपें',
    updateStatus: 'स्थिति अपडेट करें',
    addComment: 'टिप्पणी जोड़ें',
    support: 'समर्थन',
    upvote: 'अपवोट',
    
    pending: 'लंबित',
    inProgress: 'प्रगति में',
    inspectionScheduled: 'निरीक्षण निर्धारित',
    resolved: 'हल हो गया',
    rejected: 'अस्वीकृत',
    
    normal: 'सामान्य',
    high: 'उच्च',
    critical: 'गंभीर',
    
    road: 'सड़क',
    water: 'पानी',
    electricity: 'बिजली',
    streetlight: 'स्ट्रीट लाइट',
    sanitation: 'स्वच्छता',
    drainage: 'जल निकासी',
    other: 'अन्य',
    
    location: 'स्थान',
    reportedBy: 'द्वारा रिपोर्ट किया गया',
    reportedOn: 'रिपोर्ट दिनांक',
    assignedTo: 'सौंपा गया',
    department: 'विभाग',
    description: 'विवरण',
    comments: 'टिप्पणियाँ',
    photos: 'फ़ोटो',
    
    title: 'शीर्षक',
    category: 'श्रेणी',
    selectCategory: 'श्रेणी चुनें',
    enterDescription: 'विवरण दर्ज करें',
    capturePhoto: 'फ़ोटो लें',
    submit: 'सबमिट करें',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    
    languageSettings: 'भाषा सेटिंग्स',
    selectLanguage: 'भाषा चुनें',
    changeLanguage: 'भाषा बदलें',
    
    total: 'कुल',
    active: 'सक्रिय',
    overdue: 'देय',
    avgResolutionTime: 'औसत समाधान समय',
    
    noIssuesFound: 'कोई समस्या नहीं मिली',
    loading: 'लोड हो रहा है...',
    success: 'सफलता',
    error: 'त्रुटि',
    
    citizen: 'नागरिक',
    staff: 'स्टाफ',
    admin: 'प्रशासक',
  },
  
  // Tamil (தமிழ்)
  ta: {
    appName: 'குடிமக்கள் அறிக்கையாளர்',
    appSubtitle: 'நகராட்சி பிரச்சினை நிர்வாகம்',
    profile: 'சுயவிவரம்',
    profileSettings: 'சுயவிவர அமைப்புகள்',
    logout: 'வெளியேறு',
    
    dashboard: 'டாஷ்போர்டு',
    allIssues: 'அனைத்து பிரச்சினைகள்',
    myIssues: 'என் பிரச்சினைகள்',
    supportedIssues: 'ஆதரவான பிரச்சினைகள்',
    assignedIssues: 'ஒதுக்கப்பட்ட பிரச்சினைகள்',
    trendingIssues: 'டிரெண்டிங் பிரச்சினைகள்',
    
    reportIssue: 'பிரச்சினையை அறிக்கை செய்',
    viewDetails: 'விவரங்களைக் காண்க',
    assignToStaff: 'ஊழியர்களுக்கு ஒதுக்கு',
    updateStatus: 'நிலையைப் புதுப்பி',
    addComment: 'கருத்து சேர்',
    support: 'ஆதரவு',
    upvote: 'வாக்களி',
    
    pending: 'நிலுவையில்',
    inProgress: 'செயலில்',
    inspectionScheduled: 'ஆய்வு திட்டமிடப்பட்டது',
    resolved: 'தீர்க்கப்பட்டது',
    rejected: 'நிராகரிக்கப்பட்டது',
    
    normal: 'சாதாரண',
    high: 'உயர்',
    critical: 'முக்கியமான',
    
    road: 'சாலை',
    water: 'தண்ணீர்',
    electricity: 'மின்சாரம்',
    streetlight: 'தெரு விளக்கு',
    sanitation: 'சுகாதாரம்',
    drainage: 'வடிகால்',
    other: 'மற்றவை',
    
    location: 'இடம்',
    reportedBy: 'அறிக்கை செய்தவர்',
    reportedOn: 'அறிக்கை தேதி',
    assignedTo: 'ஒதுக்கப்பட்டவர்',
    department: 'துறை',
    description: 'விவரம்',
    comments: 'கருத்துகள்',
    photos: 'புகைப்படங்கள்',
    
    title: 'தலைப்பு',
    category: 'வகை',
    selectCategory: 'வகையைத் தேர்ந்தெடு',
    enterDescription: 'விவரத்தை உள்ளிடு',
    capturePhoto: 'புகைப்படம் எடு',
    submit: 'சமர்ப்பி',
    cancel: 'ரத்து செய்',
    save: 'சேமி',
    
    languageSettings: 'மொழி அமைப்புகள்',
    selectLanguage: 'மொழியைத் தேர்ந்தெடு',
    changeLanguage: 'மொழியை மாற்று',
    
    total: 'மொத்தம்',
    active: 'செயலில்',
    overdue: 'தாமதமானது',
    avgResolutionTime: 'சராசரி தீர்வு நேரம்',
    
    noIssuesFound: 'பிரச்சினைகள் இல்லை',
    loading: 'ஏற்றுகிறது...',
    success: 'வெற்றி',
    error: 'பிழை',
    
    citizen: 'குடிமகன்',
    staff: 'ஊழியர்',
    admin: 'நிர்வாகி',
  },
  
  // Telugu (తెలుగు)
  te: {
    appName: 'పౌరుల రిపోర్టర్',
    appSubtitle: 'మునిసిపల్ సమస్య నిర్వహణ',
    profile: 'ప్రొఫైల్',
    profileSettings: 'ప్రొఫైల్ సెట్టింగులు',
    logout: 'లాగ్ అవుట్',
    
    dashboard: 'డ్యాష్‌బోర్డ్',
    allIssues: 'అన్ని సమస్యలు',
    myIssues: 'నా సమస్యలు',
    supportedIssues: 'మద్దతు ఇచ్చిన సమస్యలు',
    assignedIssues: 'కేటాయించిన సమస్యలు',
    trendingIssues: 'ట్రెండింగ్ సమస్యలు',
    
    reportIssue: 'సమస్యను నివేదించండి',
    viewDetails: 'వివరాలు చూడండి',
    assignToStaff: 'సిబ్బందికి కేటాయించండి',
    updateStatus: 'స్థితిని అప్‌డేట్ చేయండి',
    addComment: 'వ్యాఖ్య జోడించండి',
    support: 'మద్దతు',
    upvote: 'ఓటు వేయండి',
    
    pending: 'పెండింగ్',
    inProgress: 'ప్రోగ్రెస్‌లో',
    inspectionScheduled: 'తనిఖీ షెడ్యూల్ చేయబడింది',
    resolved: 'పరిష్కరించబడింది',
    rejected: 'తిరస్కరించబడింది',
    
    normal: 'సాధారణ',
    high: 'ఎక్కువ',
    critical: 'క్లిష్టమైన',
    
    road: 'రోడ్డు',
    water: 'నీరు',
    electricity: 'విద్యుత్',
    streetlight: 'వీధి దీపం',
    sanitation: 'పారిశుద్ధ్యం',
    drainage: 'డ్రైనేజీ',
    other: 'ఇతర',
    
    location: 'స్థానం',
    reportedBy: 'నివేదించినవారు',
    reportedOn: 'నివేదించిన తేదీ',
    assignedTo: 'కేటాయించబడినది',
    department: 'విభాగం',
    description: 'వివరణ',
    comments: 'వ్యాఖ్యలు',
    photos: 'ఫోటోలు',
    
    title: 'శీర్షిక',
    category: 'వర్గం',
    selectCategory: 'వర్గాన్ని ఎంచుకోండి',
    enterDescription: 'వివరణను నమోదు చేయండి',
    capturePhoto: 'ఫోటో తీయండి',
    submit: 'సమర్పించండి',
    cancel: 'రద్దు చేయండి',
    save: 'సేవ్ చేయండి',
    
    languageSettings: 'భాష సెట్టింగులు',
    selectLanguage: 'భాషను ఎంచుకోండి',
    changeLanguage: 'భాషను మార్చండి',
    
    total: 'మొత్తం',
    active: 'క్రియాశీల',
    overdue: 'ఆలస్యం',
    avgResolutionTime: 'సగటు పరిష్కార సమయం',
    
    noIssuesFound: 'సమస్యలు కనుగొనబడలేదు',
    loading: 'లోడ్ అవుతోంది...',
    success: 'విజయం',
    error: 'లోపం',
    
    citizen: 'పౌరుడు',
    staff: 'సిబ్బంది',
    admin: 'అడ్మిన్',
  },
  
  // Spanish (Español)
  es: {
    appName: 'Reportero Cívico',
    appSubtitle: 'Gestión de Problemas Municipales',
    profile: 'Perfil',
    profileSettings: 'Configuración del Perfil',
    logout: 'Cerrar Sesión',
    
    dashboard: 'Panel',
    allIssues: 'Todos los Problemas',
    myIssues: 'Mis Problemas',
    supportedIssues: 'Problemas Apoyados',
    assignedIssues: 'Problemas Asignados',
    trendingIssues: 'Problemas Populares',
    
    reportIssue: 'Reportar Problema',
    viewDetails: 'Ver Detalles',
    assignToStaff: 'Asignar al Personal',
    updateStatus: 'Actualizar Estado',
    addComment: 'Agregar Comentario',
    support: 'Apoyar',
    upvote: 'Votar',
    
    pending: 'Pendiente',
    inProgress: 'En Progreso',
    inspectionScheduled: 'Inspección Programada',
    resolved: 'Resuelto',
    rejected: 'Rechazado',
    
    normal: 'Normal',
    high: 'Alto',
    critical: 'Crítico',
    
    road: 'Carretera',
    water: 'Agua',
    electricity: 'Electricidad',
    streetlight: 'Alumbrado Público',
    sanitation: 'Saneamiento',
    drainage: 'Drenaje',
    other: 'Otro',
    
    location: 'Ubicación',
    reportedBy: 'Reportado Por',
    reportedOn: 'Fecha de Reporte',
    assignedTo: 'Asignado A',
    department: 'Departamento',
    description: 'Descripción',
    comments: 'Comentarios',
    photos: 'Fotos',
    
    title: 'Título',
    category: 'Categoría',
    selectCategory: 'Seleccionar Categoría',
    enterDescription: 'Ingresar Descripción',
    capturePhoto: 'Capturar Foto',
    submit: 'Enviar',
    cancel: 'Cancelar',
    save: 'Guardar',
    
    languageSettings: 'Configuración de Idioma',
    selectLanguage: 'Seleccionar Idioma',
    changeLanguage: 'Cambiar Idioma',
    
    total: 'Total',
    active: 'Activo',
    overdue: 'Vencido',
    avgResolutionTime: 'Tiempo Promedio de Resolución',
    
    noIssuesFound: 'No se encontraron problemas',
    loading: 'Cargando...',
    success: 'Éxito',
    error: 'Error',
    
    citizen: 'Ciudadano',
    staff: 'Personal',
    admin: 'Administrador',
  },
  
  // French (Français)
  fr: {
    appName: 'Rapporteur Civique',
    appSubtitle: 'Gestion des Problèmes Municipaux',
    profile: 'Profil',
    profileSettings: 'Paramètres du Profil',
    logout: 'Déconnexion',
    
    dashboard: 'Tableau de Bord',
    allIssues: 'Tous les Problèmes',
    myIssues: 'Mes Problèmes',
    supportedIssues: 'Problèmes Soutenus',
    assignedIssues: 'Problèmes Assignés',
    trendingIssues: 'Problèmes Tendance',
    
    reportIssue: 'Signaler un Problème',
    viewDetails: 'Voir les Détails',
    assignToStaff: 'Assigner au Personnel',
    updateStatus: 'Mettre à Jour le Statut',
    addComment: 'Ajouter un Commentaire',
    support: 'Soutenir',
    upvote: 'Voter',
    
    pending: 'En Attente',
    inProgress: 'En Cours',
    inspectionScheduled: 'Inspection Programmée',
    resolved: 'Résolu',
    rejected: 'Rejeté',
    
    normal: 'Normal',
    high: 'Élevé',
    critical: 'Critique',
    
    road: 'Route',
    water: 'Eau',
    electricity: 'Électricité',
    streetlight: 'Éclairage Public',
    sanitation: 'Assainissement',
    drainage: 'Drainage',
    other: 'Autre',
    
    location: 'Emplacement',
    reportedBy: 'Signalé Par',
    reportedOn: 'Date du Signalement',
    assignedTo: 'Assigné À',
    department: 'Département',
    description: 'Description',
    comments: 'Commentaires',
    photos: 'Photos',
    
    title: 'Titre',
    category: 'Catégorie',
    selectCategory: 'Sélectionner la Catégorie',
    enterDescription: 'Entrer la Description',
    capturePhoto: 'Capturer une Photo',
    submit: 'Soumettre',
    cancel: 'Annuler',
    save: 'Enregistrer',
    
    languageSettings: 'Paramètres de Langue',
    selectLanguage: 'Sélectionner la Langue',
    changeLanguage: 'Changer de Langue',
    
    total: 'Total',
    active: 'Actif',
    overdue: 'En Retard',
    avgResolutionTime: 'Temps Moyen de Résolution',
    
    noIssuesFound: 'Aucun problème trouvé',
    loading: 'Chargement...',
    success: 'Succès',
    error: 'Erreur',
    
    citizen: 'Citoyen',
    staff: 'Personnel',
    admin: 'Administrateur',
  },
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी (Hindi)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  es: 'Español (Spanish)',
  fr: 'Français (French)',
};

export const getTranslation = (language: Language): Translations => {
  return translations[language] || translations.en;
};
