// Render function and helper functions for building the UI

function buildSlider(category, key, label, posLabel, negLabel, gradient) {
    const area = state[category][key];
    const displayValue = getDisplayValue(area.value);
    const bgColor = getAreaBackgroundColor(area.value);

    if (area.editing === undefined) area.editing = false;

    if (!area.visible) {
        return '<div class="slider-container" style="padding: 4px 8px; background: #f3f4f6; margin-bottom: 4px; display: inline-block; width: calc(50% - 2px); vertical-align: top;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; gap: 4px;">' +
                '<span style="font-size: 11px; color: #374151; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">' + label + '</span>' +
                '<button class="btn" onclick="toggleAreaVisible(\'' + category + '\', \'' + key + '\')" ' +
                        'style="padding: 3px 6px; font-size: 10px; background: #6b7280; color: white; flex-shrink: 0;">' +
                    'Show' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    if (!area.label) area.label = label;
    if (!area.posLabel) area.posLabel = posLabel;
    if (!area.negLabel) area.negLabel = negLabel;

    if (area.editing) {
        return '<div class="slider-container" style="background: ' + bgColor + '; width: 100%;">' +
            '<div style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 6px; flex-wrap: wrap;">' +
                '<div style="flex: 1; min-width: 200px;">' +
                    '<input type="text" value="' + area.label + '" id="label_' + category + '_' + key + '" ' +
                           'placeholder="Slider name..." ' +
                           'style="width: 100%; padding: 6px; border: 2px solid #3b82f6; border-radius: 4px; font-size: 13px; font-weight: 600; margin-bottom: 4px;">' +
                    '<div style="display: flex; gap: 4px; margin-bottom: 4px;">' +
                        '<input type="text" value="' + area.posLabel + '" id="pos_' + category + '_' + key + '" ' +
                               'placeholder="+5 label..." ' +
                               'style="flex: 1; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 11px;">' +
                        '<input type="text" value="' + area.negLabel + '" id="neg_' + category + '_' + key + '" ' +
                               'placeholder="-5 label..." ' +
                               'style="flex: 1; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 11px;">' +
                    '</div>' +
                '</div>' +
                '<div style="display: flex; gap: 4px;">' +
                    '<button class="btn" onclick="deleteSlider(\'' + category + '\', \'' + key + '\')" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #dc2626; color: white;">' +
                        'Delete' +
                    '</button>' +
                    '<button class="btn" onclick="saveSliderEdit(\'' + category + '\', \'' + key + '\')" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #16a34a; color: white;">' +
                        'Save' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="slider-labels">' +
                '<span>' + area.posLabel + '</span>' +
                '<span>0 Neutral</span>' +
                '<span>' + area.negLabel + '</span>' +
            '</div>' +
            '<input type="range" min="-5" max="5" value="' + (-area.value) + '" ' +
                   'onchange="updateSlider(\'' + category + '\', \'' + key + '\', -this.value)" ' +
                   (area.locked ? 'disabled' : '') + ' ' +
                   'style="background: ' + gradient + '; ' + (area.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
        '</div>';
    } else {
        return '<div class="slider-container" style="background: ' + bgColor + '; width: 100%;">' +
            '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 3px;">' +
                '<div style="flex: 1;">' +
                    '<div class="slider-header" style="margin-bottom: 0;">' +
                        '<span class="slider-label">' + area.label + '</span>' +
                        '<span class="slider-value" style="color: #111827;">' + displayValue + '</span>' +
                    '</div>' +
                '</div>' +
                '<div style="display: flex; gap: 4px;">' +
                    '<button class="btn" onclick="toggleAreaVisible(\'' + category + '\', \'' + key + '\')" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #6b7280; color: white;">' +
                        'Hide' +
                    '</button>' +
                    '<button class="btn" onclick="toggleSliderEdit(\'' + category + '\', \'' + key + '\')" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #3b82f6; color: white;">' +
                        'Edit' +
                    '</button>' +
                    '<button class="btn" onclick="toggleLock(\'' + category + '\', \'' + key + '\')" ' +
                            'style="padding: 4px 8px; font-size: 11px; ' + (area.locked ? 'background: #f59e0b; color: white;' : 'background: #16a34a; color: white;') + '">' +
                        (area.locked ? 'Unlock' : 'Lock') +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="slider-labels">' +
                '<span>' + area.posLabel + '</span>' +
                '<span>0 Neutral</span>' +
                '<span>' + area.negLabel + '</span>' +
            '</div>' +
            '<input type="range" min="-5" max="5" value="' + (-area.value) + '" ' +
                   'onchange="updateSlider(\'' + category + '\', \'' + key + '\', -this.value)" ' +
                   (area.locked ? 'disabled' : '') + ' ' +
                   'style="background: ' + gradient + '; ' + (area.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
        '</div>';
    }
}

function buildCustomSlider(section, slider) {
    const displayValue = getDisplayValue(slider.value);
    const bgColor = getAreaBackgroundColor(slider.value);
    const gradient = getStandardSliderGradient();

    if (slider.visible === undefined) slider.visible = true;

    if (!slider.visible) {
        return '<div class="slider-container" style="padding: 4px 8px; background: #f3f4f6; margin-bottom: 4px; display: inline-block; width: calc(50% - 2px); vertical-align: top;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; gap: 4px;">' +
                '<span style="font-size: 11px; color: #374151; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">' + slider.label + '</span>' +
                '<button class="btn" onclick="toggleCustomVisible(\'' + section + '\', ' + slider.id + ')" ' +
                        'style="padding: 3px 6px; font-size: 10px; background: #6b7280; color: white; flex-shrink: 0;">' +
                    'Show' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    if (slider.editing) {
        return '<div class="slider-container" style="background: ' + bgColor + '; width: 100%;">' +
            '<div style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 6px; flex-wrap: wrap;">' +
                '<div style="flex: 1; min-width: 200px;">' +
                    '<input type="text" value="' + slider.label + '" id="label_' + slider.id + '" ' +
                           'placeholder="Slider name..." ' +
                           'style="width: 100%; padding: 6px; border: 2px solid #3b82f6; border-radius: 4px; font-size: 13px; font-weight: 600; margin-bottom: 4px;">' +
                    '<div style="display: flex; gap: 4px; margin-bottom: 4px;">' +
                        '<input type="text" value="' + slider.posLabel + '" id="pos_' + slider.id + '" ' +
                               'placeholder="+5 label..." ' +
                               'style="flex: 1; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 11px;">' +
                        '<input type="text" value="' + slider.negLabel + '" id="neg_' + slider.id + '" ' +
                               'placeholder="-5 label..." ' +
                               'style="flex: 1; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 11px;">' +
                    '</div>' +
                '</div>' +
                '<div style="display: flex; gap: 4px;">' +
                    '<button class="btn" onclick="deleteCustomSlider(\'' + section + '\', ' + slider.id + ')" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #dc2626; color: white;">' +
                        'Delete' +
                    '</button>' +
                    '<button class="btn" onclick="saveCustomSlider(\'' + section + '\', ' + slider.id + ', ' +
                            'document.getElementById(\'label_' + slider.id + '\').value, ' +
                            'document.getElementById(\'pos_' + slider.id + '\').value, ' +
                            'document.getElementById(\'neg_' + slider.id + '\').value)" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #16a34a; color: white;">' +
                        'Save' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="slider-labels">' +
                '<span>' + slider.posLabel + '</span>' +
                '<span>0 Neutral</span>' +
                '<span>' + slider.negLabel + '</span>' +
            '</div>' +
            '<input type="range" min="-5" max="5" value="' + (-slider.value) + '" ' +
                   'onchange="updateCustomSlider(\'' + section + '\', ' + slider.id + ', -this.value)" ' +
                   (slider.locked ? 'disabled' : '') + ' ' +
                   'style="background: ' + gradient + '; ' + (slider.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
        '</div>';
    } else {
        return '<div class="slider-container" style="background: ' + bgColor + '; width: 100%;">' +
            '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 3px;">' +
                '<div style="flex: 1;">' +
                    '<div class="slider-header" style="margin-bottom: 0;">' +
                        '<span class="slider-label">' + slider.label + '</span>' +
                        '<span class="slider-value" style="color: #111827;">' + displayValue + '</span>' +
                    '</div>' +
                '</div>' +
                '<div style="display: flex; gap: 4px;">' +
                    '<button class="btn" onclick="toggleCustomVisible(\'' + section + '\', ' + slider.id + ')" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #6b7280; color: white;">' +
                        'Hide' +
                    '</button>' +
                    '<button class="btn" onclick="toggleCustomEdit(\'' + section + '\', ' + slider.id + ')" ' +
                            'style="padding: 4px 8px; font-size: 11px; background: #3b82f6; color: white;">' +
                        'Edit' +
                    '</button>' +
                    '<button class="btn" onclick="saveCustomSlider(\'' + section + '\', ' + slider.id + ', \'\', \'\', \'\')" ' +
                            'style="padding: 4px 8px; font-size: 11px; ' + (slider.locked ? 'background: #f59e0b; color: white;' : 'background: #16a34a; color: white;') + '">' +
                        (slider.locked ? 'Unlock' : 'Lock') +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="slider-labels">' +
                '<span>' + slider.posLabel + '</span>' +
                '<span>0 Neutral</span>' +
                '<span>' + slider.negLabel + '</span>' +
            '</div>' +
            '<input type="range" min="-5" max="5" value="' + (-slider.value) + '" ' +
                   'onchange="updateCustomSlider(\'' + section + '\', ' + slider.id + ', -this.value)" ' +
                   (slider.locked ? 'disabled' : '') + ' ' +
                   'style="background: ' + gradient + '; ' + (slider.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
        '</div>';
    }
}

function render() {
    const html =
        '<div class="card header" style="padding: 12px;">' +
            '<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">' +
                '<div style="display: flex; align-items: center; gap: 12px;">' +
                    '<h1 style="margin: 0;">Offload</h1>' +
                    '<div class="subtitle" style="margin: 0;">An emotion tolerance and shadow work companion.</div>' +
                '</div>' +
                '<button class="btn" onclick="openIntroModal()" style="padding: 6px 12px; font-size: 13px; background: #6366f1; color: white; white-space: nowrap;">ℹ️ Intro</button>' +
            '</div>' +
        '</div>' +

        '<div class="card" style="text-align: center; padding: 12px; margin-bottom: 12px;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">' +
                '<div style="font-size: 16px; font-weight: 600; color: #111827;">Where would you like to start?</div>' +
                '<button class="btn" onclick="openInfoModal(\'infoModal1\')" style="padding: 6px 12px; font-size: 13px; background: #6366f1; color: white; white-space: nowrap;">ℹ️ Info</button>' +
            '</div>' +
        '</div>' +

        '<div class="sections-grid">' +

        '<div class="section-card section-green ' + (state.section1Expanded ? 'expanded' : '') + '" ' +
             (state.section1Expanded ? '' : 'onclick="event.stopPropagation(); toggleSection(1)"') + '>' +
            '<div class="section-header">' +
                '<div>' +
                    '<div class="section-title">1. Residual Stress, Option Flexibility, & Inner Self Check-Ins</div>' +
                    (state.section1Expanded ? '' : '<div class="section-subtitle">How am I doing right now?</div>') +
                '</div>' +
                '<button class="expand-btn" onclick="event.stopPropagation(); toggleSection(1)" style="background: #eab308;">' +
                    (state.section1Expanded ? 'Hide ▲' : 'Show ▼') +
                '</button>' +
            '</div>' +
            (state.section1Expanded ?
                '<div style="margin-top: 12px;">' +
                    '<div style="font-weight: 600; font-size: 13px; color: #374151; margin-bottom: 6px; padding-left: 4px;">Baseline:</div>' +
                    buildSlider('baseline', 'regulation', 'Residual stress from recent days', '+5 Consistently regulated', '-5 Dysregulated', getBaselineSliderGradient()) +
                    buildSlider('baseline', 'flexibility', 'Flexibility of choices or options', '+5 Complete freedom', '-5 Locked in', getBaselineSliderGradient()) +
                    '<div style="font-weight: 600; font-size: 13px; color: #374151; margin: 12px 0 6px 0; padding-left: 4px;">Internal Self:</div>' +
                    '<div>' +
                        buildSlider('internalSelf', 'mental', 'Mental Activity', '+5 Creative, Pleasant', '-5 Racing/Ruminating', getStandardSliderGradient()) +
                        buildSlider('internalSelf', 'somaticBody', 'Somatic &/or Body', '+5 Calm, relaxed', '-5 Aches/pains', getStandardSliderGradient()) +
                        buildSlider('internalSelf', 'emotional', 'Emotional', '+5 Joy/Enthusiasm', '-5 Fear/Anger', getStandardSliderGradient()) +
                        buildSlider('internalSelf', 'spiritual', 'Spiritual Outlook', '+5 Supportive synchronicities', '-5 Unsupportive society', getStandardSliderGradient()) +
                        state.customExternal.map(slider => buildCustomSlider('external', slider)).join('') +
                    '</div>' +
                    '<button class="btn" onclick="addCustomSlider(\'external\')" ' +
                            'style="background: #eab308; color: white; width: 100%; padding: 10px; margin-top: 9px;">' +
                        '+ Add Custom Slider' +
                    '</button>' +
                '</div>'
            : '') +
        '</div>' +

        '<div class="section-card section-blue ' + (state.section2Expanded ? 'expanded' : '') + '" ' +
             (state.section2Expanded ? '' : 'onclick="event.stopPropagation(); toggleSection(2)"') + '>' +
            '<div class="section-header">' +
                '<div>' +
                    '<div class="section-title">2. External Life Areas</div>' +
                    (state.section2Expanded ? '' : '<div class="section-subtitle">What\'s happening in my environment?</div>') +
                '</div>' +
                '<button class="expand-btn" onclick="event.stopPropagation(); toggleSection(2)" style="background: #16a34a;">' +
                    (state.section2Expanded ? 'Hide ▲' : 'Show ▼') +
                '</button>' +
            '</div>' +
            (state.section2Expanded ?
                '<div style="margin-top: 12px;">' +
                    '<div>' +
                        buildSlider('externalAreas', 'homeImprovement', 'Home Improvement', '+5 Enjoying projects', '-5 Pressured by repairs', getStandardSliderGradient()) +
                        buildSlider('externalAreas', 'workMoney', 'Work/Income', '+5 Calm enthusiasm', '-5 Pressure/Fear', getStandardSliderGradient()) +
                        buildSlider('externalAreas', 'moneyHandling', 'Money/Resources', '+5 Curious/planning', '-5 Fear/obsession', getStandardSliderGradient()) +
                        buildSlider('externalAreas', 'relationships', 'Personal Relationships', '+5 Able to practice tolerance', '-5 Resentments/blaming', getStandardSliderGradient()) +
                        state.customExternal.map(slider => buildCustomSlider('external', slider)).join('') +
                    '</div>' +
                    '<button class="btn" onclick="addCustomSlider(\'external\')" ' +
                            'style="background: #16a34a; color: white; width: 100%; padding: 10px; margin-top: 9px;">' +
                        '+ Add Custom Slider' +
                    '</button>' +
                '</div>'
            : '') +
        '</div>' +

        '<div class="section-card section-teal ' + (state.section3Expanded ? 'expanded' : '') + '" ' +
             (state.section3Expanded ? '' : 'onclick="event.stopPropagation(); toggleSection(3)"') + '>' +
            '<div class="section-header">' +
                '<div>' +
                    '<div class="section-title">3. Known Supports & Stabilizers</div>' +
                    (state.section3Expanded ? '' : '<div class="section-subtitle">What\'s holding me?</div>') +
                '</div>' +
                '<button class="expand-btn" onclick="event.stopPropagation(); toggleSection(3)" style="background: #3b82f6;">' +
                    (state.section3Expanded ? 'Hide ▲' : 'Show ▼') +
                '</button>' +
            '</div>' +
            (state.section3Expanded ?
                '<div style="margin-top: 12px;">' +
                    buildSlider('supports', 'housingComforts', 'Self Care Supports', '+5 Enjoying comforts', '-5 Isolated/depleted', getBaselineSliderGradient()) +
                    buildSlider('supports', 'sleepQuality', 'Sleep Quality', '+5 Restorative sleep', '-5 Poor/no sleep', getBaselineSliderGradient()) +
                    buildSlider('supports', 'socialConnection', 'Social Connection', '+5 Connected/supported', '-5 Isolated/alone', getBaselineSliderGradient()) +
                    buildSlider('supports', 'financialCushion', 'Financial Cushion', '+5 Secure/comfortable', '-5 Precarious/stressed', getBaselineSliderGradient()) +
                    state.customSupports.map(slider => buildCustomSlider('supports', slider)).join('') +
                    '<button class="btn" onclick="addCustomSlider(\'supports\')" ' +
                            'style="background: #f97316; color: white; width: 100%; padding: 10px; margin-top: 9px;">' +
                        '+ Add Custom Slider' +
                    '</button>' +
                '</div>'
            : '') +
        '</div>' +

        '<div class="section-card section-orange ' + (state.section4Expanded ? 'expanded' : '') + '" ' +
             (state.section4Expanded ? '' : 'onclick="event.stopPropagation(); toggleSection(4)"') + '>' +
            '<div class="section-header">' +
                '<div>' +
                    '<div class="section-title">4. Specific Experiences</div>' +
                    (state.section4Expanded ? '' : '<div class="section-subtitle">What needs offloading right now?</div>') +
                '</div>' +
                '<button class="expand-btn" onclick="event.stopPropagation(); toggleSection(4)" style="background: #f97316;">' +
                    (state.section4Expanded ? 'Hide ▲' : 'Show ▼') +
                '</button>' +
            '</div>' +
            (state.section4Expanded ?
                '<div style="margin-top: 12px;">' +
                    state.ambient.map(amb =>
                        '<div class="slider-container" style="position: relative;">' +
                            '<div style="display: flex; gap: 8px; align-items: flex-start; flex-wrap: wrap;">' +
                                '<div style="flex: 1; min-width: 250px;">' +
                                    '<div style="margin-bottom: 6px;">' +
                                        '<label class="input-label" style="font-size: 14px; margin: 0 0 6px 0; display: block;">What is on your mind or affecting your nerves? <span style="font-weight: normal; font-style: italic;">(Could be something supportive or soothing.)</span></label>' +
                                        '<div style="display: flex; gap: 4px;">' +
                                            '<button onclick="updateAmbient(' + amb.id + ', \'type\', \'threat\')" ' +
                                                    (amb.locked ? 'disabled' : '') + ' ' +
                                                    'style="flex: 1; padding: 6px 10px; border: 2px solid #f44336; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; ' +
                                                    (amb.type === 'threat' ? 'background: #f44336; color: white;' : 'background: white; color: #f44336;') + ' ' +
                                                    (amb.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
                                                'Stressor' +
                                            '</button>' +
                                            '<button onclick="updateAmbient(' + amb.id + ', \'type\', \'opportunity\')" ' +
                                                    (amb.locked ? 'disabled' : '') + ' ' +
                                                    'style="flex: 1; padding: 6px 10px; border: 2px solid #4caf50; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; ' +
                                                    (amb.type === 'opportunity' ? 'background: #4caf50; color: white;' : 'background: white; color: #4caf50;') + ' ' +
                                                    (amb.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
                                                'Opportunity' +
                                            '</button>' +
                                            '<button onclick="updateAmbient(' + amb.id + ', \'type\', \'regulated\')" ' +
                                                    (amb.locked ? 'disabled' : '') + ' ' +
                                                    'style="flex: 1; padding: 6px 10px; border: 2px solid #1976d2; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; ' +
                                                    (amb.type === 'regulated' ? 'background: #1976d2; color: white;' : 'background: white; color: #1976d2;') + ' ' +
                                                    (amb.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
                                                'Stabilizer' +
                                            '</button>' +
                                        '</div>' +
                                    '</div>' +
                                    '<textarea onchange="updateAmbient(' + amb.id + ', \'note\', this.value)" ' +
                                              'placeholder="Brief description..." ' +
                                              (amb.locked ? 'disabled' : '') + ' ' +
                                              'style="' + (amb.locked ? 'opacity: 0.6; cursor: not-allowed; background: #f3f4f6;' : '') + '">' + amb.note + '</textarea>' +
                                '</div>' +

                                '<div style="display: flex; gap: 8px; width: 100%;">' +
                                    '<div style="flex: 0 0 75%;">' +
                                        '<div class="slider-header">' +
                                            '<span class="slider-label" style="font-size: 12px;">Intensity/Loudness</span>' +
                                            '<span class="slider-value" style="color: ' + (amb.type === 'threat' ? '#f44336' : amb.type === 'regulated' ? '#1976d2' : '#4caf50') + ';">' + amb.value + '</span>' +
                                        '</div>' +
                                        '<input type="range" min="0" max="10" value="' + amb.value + '" ' +
                                               'onchange="updateAmbient(' + amb.id + ', \'value\', this.value)" ' +
                                               (amb.locked ? 'disabled' : '') + ' ' +
                                               'style="width: 100%; background: ' + getAmbientSliderGradient(amb.type) + '; ' + (amb.locked ? 'opacity: 0.6; cursor: not-allowed;' : '') + '">' +
                                        '<div class="slider-labels">' +
                                            '<span>0 Not present</span>' +
                                            '<span>10 Very present</span>' +
                                        '</div>' +
                                    '</div>' +

                                    '<div style="display: flex; flex-direction: column; gap: 4px; align-self: center; margin-left: 10px;">' +
                                        '<button type="button" class="btn" onclick="toggleAmbientLock(' + amb.id + ')" ' +
                                                'style="padding: 4px 8px; font-size: 11px; white-space: nowrap; ' + (amb.locked ? 'background: #f59e0b; color: white;' : 'background: #3b82f6; color: white;') + '">' +
                                            (amb.locked ? 'Edit' : 'Save') +
                                        '</button>' +
                                        '<button type="button" class="btn" onclick="deleteAmbientSlider(' + amb.id + ')" ' +
                                                'style="padding: 4px 8px; font-size: 11px; white-space: nowrap; background: #dc2626; color: white;">' +
                                            'Del' +
                                        '</button>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>'
                    ).join('') +
                    (state.ambient.length < 6 ?
                        '<button class="btn" onclick="addAmbientSlider()" ' +
                                (state.ambient.some(a => !a.locked) ? 'disabled ' : '') +
                                'style="background: ' + (state.ambient.some(a => !a.locked) ? '#d1d5db' : '#f97316') + '; color: white; width: 100%; padding: 10px; margin-top: 9px; ' + (state.ambient.some(a => !a.locked) ? 'cursor: not-allowed;' : '') + '">' +
                            '+ Add Topic' + (state.ambient.some(a => !a.locked) ? ' (Save current sliders first)' : '') +
                        '</button>'
                    : '<div style="text-align: center; padding: 9px; color: #6b7280; font-style: italic; font-size: 13px;">Maximum of 6 internal experiences reached</div>') +
                '</div>'
            : '') +
        '</div>' +

        '</div>' +

        '<div class="card">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">' +
                '<h2 style="margin: 0;">Window of Tolerance Visualization</h2>' +
                '<button class="btn" onclick="openInfoModal(\'infoModal2\')" style="padding: 6px 12px; font-size: 13px; background: #6366f1; color: white; white-space: nowrap;">ℹ️ Info</button>' +
            '</div>' +
            '<div class="visualization" id="visualization">' +
                '<div class="color-legend">' +
                    '<div style="position: absolute; top: 0; left: 0; right: 0; height: 100%; background: rgba(255, 255, 255, ' + state.visualOpacity + '); border-radius: 5px; z-index: 10;"></div>' +
                    '<div style="position: absolute; top: 1.3%; left: 50%; transform: translateX(-50%); color: black; font-size: 10px; font-weight: bold; text-align: center; z-index: 12; width: 90%; padding: 4px;">' +
                        'Threat<br>Fear, Anger<br>Activated' +
                    '</div>' +
                    '<div style="position: absolute; top: 26.3%; left: 50%; transform: translateX(-50%); color: black; font-size: 10px; font-weight: bold; text-align: center; z-index: 12; width: 90%; padding: 4px;">' +
                        'Worry<br>Anxious<br>Overwhelm' +
                    '</div>' +
                    '<div style="position: absolute; top: 51.3%; left: 50%; transform: translateX(-50%); color: black; font-size: 10px; font-weight: bold; text-align: center; z-index: 12; width: 90%; padding: 4px;">' +
                        'Regulated<br>Calm<br>Grounded' +
                    '</div>' +
                    '<div style="position: absolute; top: 76.3%; left: 50%; transform: translateX(-50%); color: black; font-size: 10px; font-weight: bold; text-align: center; z-index: 12; width: 90%; padding: 4px;">' +
                        'Opportunity<br>Joy, Enthusiasm<br>Expansive' +
                    '</div>' +
                '</div>' +
                '<svg viewBox="0 0 600 300" preserveAspectRatio="none">' +
                    '<defs>' +
                        '<linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">' +
                            '<stop offset="0%" style="stop-color:#0088ff;stop-opacity:0.4" />' +
                            '<stop offset="100%" style="stop-color:#0088ff;stop-opacity:0.9" />' +
                        '</linearGradient>' +
                    '</defs>' +
                    '<path id="riverChannel" class="river-channel" d=""/>' +
                    '<path id="riverWater" class="river-water" d=""/>' +
                '</svg>' +
                '<div class="gate-top">' +
                    '<div class="gate-shape-top" id="gateShapeTop">' +
                        '<div class="gate-interior-top"></div>' +
                        '<div class="gate-outline-top"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="gate-bottom">' +
                    '<div class="gate-shape-bottom" id="gateShapeBottom">' +
                        '<div class="gate-interior-bottom"></div>' +
                        '<div class="gate-outline-bottom"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="gate-text-top" id="gateTextTop">Stress Response<br>Level: 0</div>' +
                '<div class="gate-text-bottom" id="gateTextBottom">OPPORTUNITY<br>0</div>' +
                '<div class="river-text" id="riverText">Window of Tolerance Width<br>or Internal Information<br>Processing Capacity</div>' +
            '</div>' +
            '<div style="margin-top: 12px; padding: 10px; background: #f9fafb; border-radius: 6px;">' +
                '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">' +
                    '<span style="font-weight: 600; font-size: 13px; color: #374151;">Color Brightness</span>' +
                    '<span style="font-weight: 600; font-size: 14px; color: #111827;">' + Math.round((1 - state.visualOpacity) * 100) + '%</span>' +
                '</div>' +
                '<input type="range" min="0" max="1" step="0.05" value="' + state.visualOpacity + '" ' +
                       'onchange="updateVisualOpacity(this.value)" ' +
                       'style="width: 100%; background: linear-gradient(to right, #fbbf24 0%, #a855f7 50%, #3b82f6 100%);">' +
                '<div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280; margin-top: 2px;">' +
                    '<span>Dim (more white)</span>' +
                    '<span>Bright (less white)</span>' +
                '</div>' +
            '</div>' +
        '</div>' +

        '<div class="card" style="border: 1px solid #16a34a;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">' +
                '<div style="display: flex; align-items: center; gap: 12px;">' +
                    '<h2 style="margin: 0;">💾 Current Entry</h2>' +
                    '<button class="btn" onclick="openInfoModal(\'infoModal3\')" style="padding: 6px 12px; font-size: 13px; background: #6366f1; color: white; white-space: nowrap;">ℹ️ Info</button>' +
                '</div>' +
                '<button class="btn" onclick="saveEntry()" style="background: #16a34a; color: white; white-space: nowrap; padding: 10px 20px;">Save Entry</button>' +
            '</div>' +
            (state.saveError ? '<div style="color: #dc2626; margin-bottom: 12px;">' + state.saveError + '</div>' : '') +
            '<div style="display: flex; gap: 20px;">' +
                '<div style="flex: 1;">' +
                    '<div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">' +
                        'Threat: ' + getThreatLoad() + ' | Opportunity: ' + getOpportunityLoad() + ' | Regulated: ' + getRegulatedLoad() +
                    '</div>' +
                    '<div style="font-size: 14px; color: #6b7280;" id="currentPercentages">' +
                        'Calculating percentages...' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +

        '<div class="card">' +
            '<div id="entriesContainer"></div>' +
        '</div>';

    document.getElementById('app').innerHTML = html;

    const threatLoad = getThreatLoad();
    const opportunityLoad = getOpportunityLoad();
    const regulatedLoad = getRegulatedLoad();
    setTimeout(() => updateVisualization(threatLoad, opportunityLoad, regulatedLoad), 0);
    displayEntries();
}
