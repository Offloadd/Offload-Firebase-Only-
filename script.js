// Offload Application - Main JavaScript
// State management and all application logic

// ============================================================================
// FIREBASE AUTH FUNCTIONS
// ============================================================================

async function handleCreateAccount() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const btn = document.getElementById('createAccountBtn');
    
    if (!email || !password) {
        showAuthMessage('Please enter email and password', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Creating Account...';
    
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        showAuthMessage('Account created successfully!', 'success');
    } catch (error) {
        console.error('Create account error:', error);
        showAuthMessage(getFirebaseErrorMessage(error), 'error');
        btn.disabled = false;
        btn.textContent = 'Create Account';
    }
}

async function handleSignIn() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const btn = document.getElementById('signInBtn');
    
    if (!email || !password) {
        showAuthMessage('Please enter email and password', 'error');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Signing In...';
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error('Sign in error:', error);
        showAuthMessage(getFirebaseErrorMessage(error), 'error');
        btn.disabled = false;
        btn.textContent = 'Sign In';
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        // Reset state on logout
        state.entries = [];
        render();
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out: ' + error.message);
    }
}

function showAuthMessage(message, type) {
    const authMessage = document.getElementById('authMessage');
    authMessage.textContent = message;
    authMessage.className = 'auth-message show ' + (type === 'success' ? 'success' : '');
}

function getFirebaseErrorMessage(error) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.'
    };
    
    return errorMessages[error.code] || error.message;
}

// ============================================================================
// FIRESTORE DATABASE FUNCTIONS
// ============================================================================

async function saveToFirestore(entry) {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized, skipping cloud save');
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection('entries').add(entry);
        console.log('Entry saved to Firestore');
    } catch (error) {
        console.error('Error saving to Firestore:', error);
        // Don't alert user - localStorage backup will work
    }
}

async function loadFromFirestore() {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized');
        return;
    }
    
    try {
        const snapshot = await db.collection('users')
            .doc(user.uid)
            .collection('entries')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();
        
        const entries = [];
        snapshot.forEach(doc => {
            entries.push({ id: doc.id, ...doc.data() });
        });
        
        state.entries = entries;
        console.log('Loaded', entries.length, 'entries from Firestore');
        
        // Also save to localStorage as backup
        saveToUserStorage('entries', JSON.stringify(entries));
    } catch (error) {
        console.error('Error loading from Firestore:', error);
        // Fall back to localStorage
        loadEntriesFromLocalStorage();
    }
}

async function deleteFromFirestore(entryId) {
    const user = window.currentUser;
    if (!user || !window.db || !entryId) {
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection('entries').doc(entryId).delete();
        console.log('Entry deleted from Firestore');
    } catch (error) {
        console.error('Error deleting from Firestore:', error);
    }
}

async function clearFirestoreEntries() {
    const user = window.currentUser;
    if (!user || !window.db) {
        return;
    }
    
    try {
        const snapshot = await db.collection('users')
            .doc(user.uid)
            .collection('entries')
            .get();
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log('All entries cleared from Firestore');
    } catch (error) {
        console.error('Error clearing Firestore:', error);
    }
}

function loadEntriesFromLocalStorage() {
    const saved = loadFromUserStorage('entries');
    if (saved) {
        try {
            state.entries = JSON.parse(saved);
            console.log('Loaded', state.entries.length, 'entries from localStorage (backup)');
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            state.entries = [];
        }
    }
}

// ============================================================================
// USER-SPECIFIC STORAGE FUNCTIONS
// ============================================================================

function getUserStorageKey(key) {
    const user = window.currentUser;
    if (!user) return key;
    return `offload_${user.uid}_${key}`;
}

function saveToUserStorage(key, value) {
    const userKey = getUserStorageKey(key);
    localStorage.setItem(userKey, typeof value === 'string' ? value : JSON.stringify(value));
}

function loadFromUserStorage(key) {
    const userKey = getUserStorageKey(key);
    return localStorage.getItem(userKey);
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
    section1Expanded: false,
    section2Expanded: false,
    section3Expanded: false,
    section4Expanded: false,
    visualOpacity: 0.4,
    customExternal: [],
    customSupports: [],
    
    baseline: {
        regulation: { value: 0, interacted: false, locked: false, visible: true },
        flexibility: { value: 0, interacted: false, locked: false, visible: true }
    },
    
    internalSelf: {
        mental: { value: 0, locked: false, interacted: false, visible: false },
        somaticBody: { value: 0, locked: false, interacted: false, visible: false },
        emotional: { value: 0, locked: false, interacted: false, visible: false },
        spiritual: { value: 0, locked: false, interacted: false, visible: false }
    },
    
    externalAreas: {
        homeImprovement: { value: 0, locked: false, interacted: false, visible: false },
        workMoney: { value: 0, locked: false, interacted: false, visible: false },
        moneyHandling: { value: 0, locked: false, interacted: false, visible: false },
        relationships: { value: 0, locked: false, interacted: false, visible: false }
    },
    
    supports: {
        housingComforts: { value: 0, locked: false, interacted: false, visible: false },
        sleepQuality: { value: 0, locked: false, interacted: false, visible: false },
        socialConnection: { value: 0, locked: false, interacted: false, visible: false },
        financialCushion: { value: 0, locked: false, interacted: false, visible: false }
    },
    
    ambient: [
        { id: Date.now(), value: 0, type: 'opportunity', note: '', locked: false }
    ],
    
    entries: [],
    saveError: ''
};

function toggleSection(section) {
    if (section === 1) state.section1Expanded = !state.section1Expanded;
    if (section === 2) state.section2Expanded = !state.section2Expanded;
    if (section === 3) state.section3Expanded = !state.section3Expanded;
    if (section === 4) state.section4Expanded = !state.section4Expanded;
    render();
}

function toggleAreaVisible(category, key) {
    state[category][key].visible = !state[category][key].visible;
    saveState();
    render();
}

function getDisplayValue(internalValue) {
    if (internalValue === 0) return '0';
    if (internalValue > 0) return '+' + internalValue;
    if (internalValue < 0) return internalValue.toString();
    return '0';
}

function getSliderColor(value) {
    if (value > 0) {
        const intensity = value / 5;
        const red = Math.round(100 - (100 * intensity));
        const green = Math.round(220 + (35 * intensity));
        const blue = Math.round(100 - (100 * intensity));
        return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    } else if (value < 0) {
        const absValue = Math.abs(value);
        if (absValue <= 1.5) {
            const intensity = absValue / 1.5;
            const red = Math.round(68 + (200 * intensity));
            const green = Math.round(136 + (100 * intensity));
            const blue = Math.round(255 - (155 * intensity));
            return 'rgb(' + Math.min(red, 255) + ', ' + Math.min(green, 255) + ', ' + blue + ')';
        } else {
            const intensity = (absValue - 1.5) / 3.5;
            const red = 255;
            const green = Math.round(236 - (136 * intensity));
            const blue = Math.round(100 - (100 * intensity));
            return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
        }
    } else {
        return 'rgb(68, 136, 255)';
    }
}

function getAreaBackgroundColor(value) {
    if (value >= 3) {
        return 'rgba(68, 136, 255, 0.25)';
    } else if (value >= 1) {
        return 'rgba(68, 136, 255, 0.15)';
    } else if (value === 0) {
        return '#f9fafb';
    } else if (value >= -2) {
        return 'rgba(255, 235, 59, 0.4)';
    } else if (value >= -4) {
        return 'rgba(255, 152, 0, 0.35)';
    } else {
        return 'rgba(244, 67, 54, 0.3)';
    }
}

function getBaselineSliderGradient() {
    return 'linear-gradient(to right, #4488ff 0%, #bbdefb 30%, #d3d3d3 50%, #ffeb3b 65%, #ff9800 82.5%, #f44336 100%)';
}

function getStandardSliderGradient() {
    return 'linear-gradient(to right, #64ff64 0%, #4488ff 50%, #ffaa44 75%, #ff4444 100%)';
}

function toggleLock(category, key) {
    state[category][key].locked = !state[category][key].locked;
    render();
}

function toggleSliderEdit(category, key) {
    state[category][key].editing = !state[category][key].editing;
    render();
}

function saveSliderEdit(category, key) {
    const area = state[category][key];
    const labelInput = document.getElementById('label_' + category + '_' + key);
    const posInput = document.getElementById('pos_' + category + '_' + key);
    const negInput = document.getElementById('neg_' + category + '_' + key);

    if (labelInput && posInput && negInput) {
        area.label = labelInput.value;
        area.posLabel = posInput.value;
        area.negLabel = negInput.value;
    }

    area.editing = false;
    render();
}

function deleteSlider(category, key) {
    if (confirm('Delete this slider? This cannot be undone.')) {
        state[category][key].visible = false;
        state[category][key].value = 0;
        state[category][key].locked = false;
        state[category][key].interacted = false;
        render();
    }
}

function toggleAmbientLock(id) {
    const amb = state.ambient.find(a => a.id === id);
    if (amb) {
        amb.locked = !amb.locked;
        render();
    }
}

function addAmbientSlider() {
    if (state.ambient.length >= 6) return;
    state.ambient.push({
        id: Date.now(),
        value: 0,
        type: 'opportunity',
        note: '',
        locked: false
    });
    render();
}

function deleteAmbientSlider(id) {
    if (state.ambient.length <= 1) {
        alert('Must keep at least one internal experience slider');
        return;
    }
    state.ambient = state.ambient.filter(a => a.id !== id);
    render();
}

function addCustomSlider(section) {
    const customArray = section === 'external' ? state.customExternal : state.customSupports;
    customArray.push({
        id: Date.now(),
        label: 'New Slider',
        posLabel: '+5 Positive',
        negLabel: '-5 Negative',
        value: 0,
        locked: false,
        editing: false,
        interacted: false,
        visible: true
    });
    saveState();
    render();
}

function toggleCustomEdit(section, id) {
    const customArray = section === 'external' ? state.customExternal : state.customSupports;
    const slider = customArray.find(s => s.id === id);
    if (slider) {
        slider.editing = !slider.editing;
        saveState();
        render();
    }
}

function saveCustomSlider(section, id, label, posLabel, negLabel) {
    const customArray = section === 'external' ? state.customExternal : state.customSupports;
    const slider = customArray.find(s => s.id === id);
    if (slider) {
        if (slider.editing) {
            slider.label = label;
            slider.posLabel = posLabel;
            slider.negLabel = negLabel;
            slider.editing = false;
        } else {
            slider.locked = !slider.locked;
        }
        saveState();
        render();
    }
}

function deleteCustomSlider(section, id) {
    if (section === 'external') {
        state.customExternal = state.customExternal.filter(s => s.id !== id);
    } else {
        state.customSupports = state.customSupports.filter(s => s.id !== id);
    }
    saveState();
    render();
}

function toggleCustomVisible(section, id) {
    const customArray = section === 'external' ? state.customExternal : state.customSupports;
    const slider = customArray.find(s => s.id === id);
    if (slider) {
        slider.visible = !slider.visible;
        saveState();
        render();
    }
}

function updateCustomSlider(section, id, value) {
    const customArray = section === 'external' ? state.customExternal : state.customSupports;
    const slider = customArray.find(s => s.id === id);
    if (slider && !slider.locked) {
        slider.value = parseInt(value);
        slider.interacted = true;
        saveState();
        render();
    }
}

function saveState() {
    try {
        const stateToSave = {
            customExternal: state.customExternal,
            customSupports: state.customSupports,
            baselineVisible: Object.keys(state.baseline).reduce((acc, key) => {
                acc[key] = state.baseline[key].visible;
                return acc;
            }, {}),
            internalSelfVisible: Object.keys(state.internalSelf).reduce((acc, key) => {
                acc[key] = state.internalSelf[key].visible;
                return acc;
            }, {}),
            externalAreasVisible: Object.keys(state.externalAreas).reduce((acc, key) => {
                acc[key] = state.externalAreas[key].visible;
                return acc;
            }, {}),
            supportsVisible: Object.keys(state.supports).reduce((acc, key) => {
                acc[key] = state.supports[key].visible;
                return acc;
            }, {})
        };
        saveToUserStorage('offloadState', JSON.stringify(stateToSave));
    } catch (e) {
        console.error('Error saving state:', e);
    }
}

function loadState() {
    try {
        const saved = loadFromUserStorage('offloadState');
        if (saved) {
            const parsed = JSON.parse(saved);
            
            if (parsed.customExternal) {
                state.customExternal = parsed.customExternal;
            }
            if (parsed.customSupports) {
                state.customSupports = parsed.customSupports;
            }
            
            if (parsed.baselineVisible) {
                Object.keys(parsed.baselineVisible).forEach(key => {
                    if (state.baseline[key]) {
                        state.baseline[key].visible = parsed.baselineVisible[key];
                    }
                });
            }
            if (parsed.internalSelfVisible) {
                Object.keys(parsed.internalSelfVisible).forEach(key => {
                    if (state.internalSelf[key]) {
                        state.internalSelf[key].visible = parsed.internalSelfVisible[key];
                    }
                });
            }
            if (parsed.externalAreasVisible) {
                Object.keys(parsed.externalAreasVisible).forEach(key => {
                    if (state.externalAreas[key]) {
                        state.externalAreas[key].visible = parsed.externalAreasVisible[key];
                    }
                });
            }
            if (parsed.supportsVisible) {
                Object.keys(parsed.supportsVisible).forEach(key => {
                    if (state.supports[key]) {
                        state.supports[key].visible = parsed.supportsVisible[key];
                    }
                });
            }
        }
    } catch (e) {
        console.error('Error loading state:', e);
    }
}

function updateSlider(category, key, value) {
    if (!state[category][key].locked) {
        state[category][key].value = parseInt(value);
        state[category][key].interacted = true;
        render();
    }
}

function updateAmbient(id, field, value) {
    const amb = state.ambient.find(a => a.id === id);
    if (!amb || amb.locked) return;

    if (field === 'value') {
        amb.value = parseInt(value);
    } else {
        amb[field] = value;
    }
    render();
}

function getThreatLoad() {
    let threatTotal = 0;

    Object.values(state.baseline).forEach(slider => {
        if (!slider.interacted) return;
        if (slider.value < -1) {
            threatTotal += Math.abs(slider.value) - 1;
        }
    });

    Object.values(state.internalSelf).forEach(area => {
        if (!area.interacted) return;
        if (area.value < -1) {
            threatTotal += Math.abs(area.value) - 1;
        }
    });

    Object.values(state.externalAreas).forEach(area => {
        if (!area.interacted) return;
        if (area.value < -1) {
            threatTotal += Math.abs(area.value) - 1;
        }
    });

    Object.values(state.supports).forEach(support => {
        if (!support.interacted) return;
        if (support.value < -1) {
            threatTotal += Math.abs(support.value) - 1;
        }
    });

    state.customExternal.forEach(slider => {
        if (!slider.interacted) return;
        if (slider.value < -1) {
            threatTotal += Math.abs(slider.value) - 1;
        }
    });

    state.customSupports.forEach(slider => {
        if (!slider.interacted) return;
        if (slider.value < -1) {
            threatTotal += Math.abs(slider.value) - 1;
        }
    });

    state.ambient.forEach(amb => {
        if (amb.value !== 0 && amb.type === 'threat') {
            threatTotal += amb.value;
        }
    });

    return threatTotal;
}

function getOpportunityLoad() {
    let opportunityTotal = 0;

    Object.values(state.internalSelf).forEach(area => {
        if (!area.interacted) return;
        if (area.value > 1) {
            opportunityTotal += (area.value - 1);
        }
    });

    Object.values(state.externalAreas).forEach(area => {
        if (!area.interacted) return;
        if (area.value > 1) {
            opportunityTotal += (area.value - 1);
        }
    });

    state.customExternal.forEach(slider => {
        if (!slider.interacted) return;
        if (slider.value > 1) {
            opportunityTotal += (slider.value - 1);
        }
    });

    state.ambient.forEach(amb => {
        if (amb.value !== 0 && amb.type === 'opportunity') {
            opportunityTotal += amb.value;
        }
    });

    return opportunityTotal;
}

function getRegulatedLoad() {
    let regulatedTotal = 0;

    Object.values(state.baseline).forEach(slider => {
        if (!slider.interacted) return;
        if (slider.value === -1 || slider.value === 1) {
            regulatedTotal += 1;
        } else if (slider.value > 1) {
            regulatedTotal += (slider.value - 1);
        }
    });

    Object.values(state.internalSelf).forEach(area => {
        if (!area.interacted) return;
        if (area.value === -1 || area.value === 1) {
            regulatedTotal += 1;
        }
    });

    Object.values(state.externalAreas).forEach(area => {
        if (!area.interacted) return;
        if (area.value === -1 || area.value === 1) {
            regulatedTotal += 1;
        }
    });

    Object.values(state.supports).forEach(support => {
        if (!support.interacted) return;
        if (support.value === -1 || support.value === 1) {
            regulatedTotal += 1;
        } else if (support.value > 1) {
            regulatedTotal += (support.value - 1);
        }
    });

    state.customExternal.forEach(slider => {
        if (!slider.interacted) return;
        if (slider.value === -1 || slider.value === 1) {
            regulatedTotal += 1;
        }
    });

    state.customSupports.forEach(slider => {
        if (!slider.interacted) return;
        if (slider.value === -1 || slider.value === 1) {
            regulatedTotal += 1;
        } else if (slider.value > 1) {
            regulatedTotal += (slider.value - 1);
        }
    });

    state.ambient.forEach(amb => {
        if (amb.value !== 0 && amb.type === 'regulated') {
            regulatedTotal += amb.value;
        }
    });

    return regulatedTotal;
}

function validateSave() {
    const errors = [];
    state.ambient.forEach((amb, i) => {
        if (amb.value !== 0) {
            if (!amb.type) errors.push('Internal Activity ' + (i+1) + ': Type is required when slider is not at 0');
            if (!amb.note.trim()) errors.push('Internal Activity ' + (i+1) + ': Note is required when slider is not at 0');
        }
    });
    return errors;
}

async function saveEntry() {
    const errors = validateSave();
    if (errors.length > 0) {
        state.saveError = errors.join('<br>');
        render();
        return;
    }

    state.saveError = '';

    const threatLoad = getThreatLoad();
    const opportunityLoad = getOpportunityLoad();
    const regulatedLoad = getRegulatedLoad();

    const filterNonZero = (obj) => {
        const filtered = {};
        Object.keys(obj).forEach(key => {
            if (obj[key] !== 0) {
                filtered[key] = obj[key];
            }
        });
        return Object.keys(filtered).length > 0 ? filtered : undefined;
    };

    const entry = {
        timestamp: new Date().toISOString(),
        baseline: filterNonZero(Object.keys(state.baseline).reduce((acc, key) => {
            acc[key] = state.baseline[key].value;
            return acc;
        }, {})),
        internalSelf: filterNonZero(Object.keys(state.internalSelf).reduce((acc, key) => {
            acc[key] = state.internalSelf[key].value;
            return acc;
        }, {})),
        externalAreas: filterNonZero(Object.keys(state.externalAreas).reduce((acc, key) => {
            acc[key] = state.externalAreas[key].value;
            return acc;
        }, {})),
        supports: filterNonZero(Object.keys(state.supports).reduce((acc, key) => {
            acc[key] = state.supports[key].value;
            return acc;
        }, {})),
        customExternal: state.customExternal
            .filter(slider => slider.value !== 0)
            .map(slider => ({
                label: slider.label,
                value: slider.value
            })),
        customSupports: state.customSupports
            .filter(slider => slider.value !== 0)
            .map(slider => ({
                label: slider.label,
                value: slider.value
            })),
        ambient: state.ambient
            .filter(a => a.value !== 0)
            .map(a => ({
                value: a.value,
                type: a.type,
                note: a.note
            })),
        threatLoad,
        opportunityLoad,
        regulatedLoad
    };

    Object.keys(entry).forEach(key => {
        if (entry[key] === undefined || (Array.isArray(entry[key]) && entry[key].length === 0)) {
            delete entry[key];
        }
    });

    // Save to Firestore (cloud)
    await saveToFirestore(entry);
    
    // Also save to localStorage as backup
    state.entries.unshift(entry);
    saveToUserStorage('entries', JSON.stringify(state.entries));

    render();
}

function copyEntries() {
    const text = state.entries.map(e => {
        const date = new Date(e.timestamp).toLocaleString();
        return '=== ' + date + ' ===\nThreat: ' + e.threatLoad + ' | Regulated: ' + e.regulatedLoad + ' | Opportunity: ' + e.opportunityLoad;
    }).join('\n\n');
    navigator.clipboard.writeText(text);
    alert('Entries copied!');
}

async function clearEntries() {
    if (confirm('Clear all entries? This cannot be undone.')) {
        // Clear from Firestore
        await clearFirestoreEntries();
        
        // Clear from state and localStorage
        state.entries = [];
        saveToUserStorage('entries', JSON.stringify(state.entries));
        render();
    }
}

function openIntroModal() {
    document.getElementById('introModal').classList.add('active');
}

function closeIntroModal() {
    document.getElementById('introModal').classList.remove('active');
}

function openInfoModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeInfoModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function updateVisualOpacity(value) {
    state.visualOpacity = parseFloat(value);
    render();
}

function saveModalContent(modalId) {
    let contentDiv;
    contentDiv = document.getElementById(modalId);
    if (!contentDiv) {
        contentDiv = document.getElementById(modalId + '_content');
    }
    
    if (contentDiv) {
        const content = contentDiv.innerHTML;
        localStorage.setItem('modal_' + modalId, content);
        console.log('Saved content for:', modalId);
        return true;
    } else {
        console.error('Could not find content div for:', modalId);
        return false;
    }
}

function saveAllModalContent(modalIds) {
    let allSaved = true;
    modalIds.forEach(id => {
        if (!saveModalContent(id)) {
            allSaved = false;
        }
    });
    if (allSaved) {
        alert('✅ All changes saved!');
    } else {
        alert('⚠️ Some changes could not be saved. Check the console for details.');
    }
}

function loadModalContent() {
    console.log('Loading modal content from localStorage...');
    
    const introContent = localStorage.getItem('modal_introModal');
    if (introContent) {
        const introDiv = document.getElementById('introModal_content');
        if (introDiv) {
            introDiv.innerHTML = introContent;
            console.log('Loaded introModal content');
        } else {
            console.warn('introModal_content div not found');
        }
    }
    
    const introContent2 = localStorage.getItem('modal_introModal_content2');
    if (introContent2) {
        const introDiv2 = document.getElementById('introModal_content2');
        if (introDiv2) {
            introDiv2.innerHTML = introContent2;
            console.log('Loaded introModal_content2');
        } else {
            console.warn('introModal_content2 div not found');
        }
    }
    
    for (let i = 1; i <= 3; i++) {
        const modalId = 'infoModal' + i;
        const content = localStorage.getItem('modal_' + modalId);
        if (content) {
            const div = document.getElementById(modalId + '_content');
            if (div) {
                div.innerHTML = content;
                console.log('Loaded ' + modalId + ' content');
            } else {
                console.warn(modalId + '_content div not found');
            }
        }
    }
    
    console.log('Modal content loading complete');
}

function updateVisualization(threatLoad, opportunityLoad, regulatedLoad) {
    const visualization = document.getElementById('visualization');
    if (!visualization) return;

    const gateShapeTop = document.getElementById('gateShapeTop');
    const gateShapeBottom = document.getElementById('gateShapeBottom');
    const gateTextTop = document.getElementById('gateTextTop');
    const gateTextBottom = document.getElementById('gateTextBottom');
    const riverChannel = document.getElementById('riverChannel');
    const riverWater = document.getElementById('riverWater');
    const riverText = document.getElementById('riverText');

    const height = 300;
    const maxLoad = 50;
    const minGateHeight = 30;

    const regulatedReduction = regulatedLoad * 2;

    let topGateHeight = minGateHeight + Math.max(0, Math.min((threatLoad / maxLoad) * height * 1.8, height * 0.9) - regulatedReduction);
    let bottomGateHeight = minGateHeight + Math.max(0, Math.min((opportunityLoad / maxLoad) * height * 1.8, height * 0.9) - regulatedReduction);

    const combinedHeight = topGateHeight + bottomGateHeight;
    const maxCombined = height * 0.9;

    if (combinedHeight > maxCombined) {
        const scaleFactor = maxCombined / combinedHeight;
        topGateHeight = Math.max(minGateHeight, topGateHeight * scaleFactor);
        bottomGateHeight = Math.max(minGateHeight, bottomGateHeight * scaleFactor);
    }

    gateShapeTop.style.height = topGateHeight + 'px';
    gateShapeBottom.style.height = bottomGateHeight + 'px';

    const availableSpace = height - topGateHeight - bottomGateHeight;

    const topPercent = Math.round((topGateHeight / height) * 100);
    const bottomPercent = Math.round((bottomGateHeight / height) * 100);
    const middlePercent = Math.round((availableSpace / height) * 100);

    gateTextTop.textContent = 'Stress - ' + topPercent + '%';
    gateTextBottom.textContent = 'Opportunity - ' + bottomPercent + '%';

    const percentagesDisplay = document.getElementById('currentPercentages');
    if (percentagesDisplay) {
        percentagesDisplay.textContent = 'Stress: ' + topPercent + '% | Regulated: ' + middlePercent + '% | Opportunity: ' + bottomPercent + '%';
    }

    const regulatedFactor = regulatedLoad / 30;

    const maxThreatForColor = 40;
    const maxOppForColor = 40;
    const maxRegForColor = 30;

    const threatIntensity = Math.min(threatLoad / maxThreatForColor, 1);
    const opportunityIntensity = Math.min(opportunityLoad / maxOppForColor, 1);
    const regulatedIntensity = Math.min(regulatedLoad / maxRegForColor, 1);

    let threatR, threatG, threatB;
    if (threatIntensity === 0) {
        threatR = 255; threatG = 170; threatB = 68;
    } else if (threatIntensity < 0.5) {
        const factor = threatIntensity * 2;
        threatR = 255;
        threatG = Math.round(170 - (102 * factor));
        threatB = Math.round(68 - (68 * factor));
    } else {
        const factor = (threatIntensity - 0.5) * 2;
        threatR = 255;
        threatG = Math.round(68 - (68 * factor));
        threatB = 0;
    }

    let riverR, riverG, riverB;
    if (regulatedIntensity === 0) {
        riverR = 180; riverG = 180; riverB = 180;
    } else {
        riverR = Math.round(180 - (112 * regulatedIntensity));
        riverG = Math.round(180 - (44 * regulatedIntensity));
        riverB = Math.round(180 + (75 * regulatedIntensity));
    }

    let oppR, oppG, oppB;
    if (opportunityIntensity === 0) {
        oppR = 68; oppG = 255; oppB = 68;
    } else {
        const factor = opportunityIntensity;
        oppR = Math.round(68 - (0 * factor));
        oppG = 255;
        oppB = Math.round(68 - (0 * factor));
    }

    const opacity = state.visualOpacity;
    threatR = Math.round(threatR + (255 - threatR) * opacity);
    threatG = Math.round(threatG + (255 - threatG) * opacity);
    threatB = Math.round(threatB + (255 - threatB) * opacity);
    
    riverR = Math.round(riverR + (255 - riverR) * opacity);
    riverG = Math.round(riverG + (255 - riverG) * opacity);
    riverB = Math.round(riverB + (255 - riverB) * opacity);
    
    oppR = Math.round(oppR + (255 - oppR) * opacity);
    oppG = Math.round(oppG + (255 - oppG) * opacity);
    oppB = Math.round(oppB + (255 - oppB) * opacity);

    visualization.style.background = 'linear-gradient(to bottom, ' +
        'rgb(' + threatR + ', ' + threatG + ', ' + threatB + ') 0%, ' +
        'rgb(' + threatR + ', ' + threatG + ', ' + threatB + ') ' + ((topGateHeight / height) * 100) + '%, ' +
        'rgb(' + riverR + ', ' + riverG + ', ' + riverB + ') ' + ((topGateHeight / height) * 100) + '%, ' +
        'rgb(' + riverR + ', ' + riverG + ', ' + riverB + ') ' + (((height - bottomGateHeight) / height) * 100) + '%, ' +
        'rgb(' + oppR + ', ' + oppG + ', ' + oppB + ') ' + (((height - bottomGateHeight) / height) * 100) + '%, ' +
        'rgb(' + oppR + ', ' + oppG + ', ' + oppB + ') 100%)';

    const width = 600;
    const riverTop = topGateHeight;
    const riverBottom = height - bottomGateHeight;
    const riverHeight = riverBottom - riverTop;

    const spaceFactor = availableSpace / height;
    const maxChannelWidth = height * 0.5;
    const minChannelWidth = height * 0.08;

    let channelWidth = minChannelWidth + (spaceFactor * (maxChannelWidth - minChannelWidth));
    const regulatedBonus = regulatedFactor * (height * 0.4);
    channelWidth = Math.min(channelWidth + regulatedBonus, riverHeight * 0.95);

    const waterWidth = channelWidth * 0.85;

    const channelTopY = riverTop;
    const channelBottomY = riverBottom;

    const channelPath = 'M 0,' + channelTopY + ' L ' + width + ',' + channelTopY + ' L ' + width + ',' + channelBottomY + ' L 0,' + channelBottomY + ' Z';

    const waterTopY = riverTop + (riverHeight - waterWidth) / 2;
    const waterBottomY = waterTopY + waterWidth;
    const waterPath = 'M 0,' + waterTopY + ' L ' + width + ',' + waterTopY + ' L ' + width + ',' + waterBottomY + ' L 0,' + waterBottomY + ' Z';

    riverChannel.setAttribute('d', channelPath);
    riverWater.setAttribute('d', waterPath);

    const centerY = topGateHeight + (availableSpace / 2);
    riverText.style.top = centerY + 'px';

    riverText.innerHTML = 'Regulated<br>Processing<br>Capacity - ' + middlePercent + '%';

    const availablePercent = availableSpace / height;

    if (availablePercent < 0.3) {
        const fontSize = Math.max(8, availablePercent * 40);
        const letterSpacing = Math.max(0, (0.3 - availablePercent) * 10);
        riverText.style.fontSize = fontSize + 'px';
        riverText.style.letterSpacing = letterSpacing + 'px';
    } else {
        riverText.style.fontSize = '14px';
        riverText.style.letterSpacing = '0px';
    }
}

function getAmbientSliderGradient(type) {
    if (type === 'threat') {
        return 'linear-gradient(to right, #ffeb3b 0%, #ff9800 50%, #f44336 100%)';
    } else if (type === 'regulated') {
        return 'linear-gradient(to right, #bbdefb 0%, #1976d2 100%)';
    } else if (type === 'opportunity') {
        return 'linear-gradient(to right, #c8e6c9 0%, #4caf50 50%, #cddc39 100%)';
    }
    return 'linear-gradient(to right, #d1d5db 0%, #d1d5db 100%)';
}

// NOTE: render() function and buildSlider functions will be added separately
// The render() function is very large and builds all the UI sections

function render() {
    // Placeholder - full render function to be added
    console.log('Render function needs to be added');
    
    // Update visualization immediately
    const threatLoad = getThreatLoad();
    const opportunityLoad = getOpportunityLoad();
    const regulatedLoad = getRegulatedLoad();
    setTimeout(() => updateVisualization(threatLoad, opportunityLoad, regulatedLoad), 0);
}

// Initialize only after user is authenticated
// Auth state listener in index.html will call loadState() and render()
console.log('Offload script loaded - waiting for authentication');
