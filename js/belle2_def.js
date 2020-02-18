Blockly.Blocks['particle_combiner'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Combine 2 particles");
    this.appendValueInput("list1")
        .setCheck("particle list")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Particle 1");
    this.appendValueInput("list2")
        .setCheck("particle list")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Particle 2");
    this.appendDummyInput()
        .appendField("Same particle lists?")
        .appendField(new Blockly.FieldDropdown([["No", "0"], ["Yes", "1"]]), "sameparticles");
    this.appendDummyInput()
        .appendField("Set identity to")
       .appendField(new Blockly.FieldDropdown([["electron", "ELECTRON"], ["muon", "MUON"], ["pion", "PION"], ["kaon", "KAON"], 
                                                  ["proton", "PROTON"], ["photon", "PHOTON"], ["Phi meson", "PHI"], ["D meson", "D"], 
                                                  ["D* meson", "DSTAR"], ["J/Psi meson", "JPSI"],["B meson","B"], ["Lambda 0","LAMBDA0"], ["do not set","ALL"]]), "simplepid");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Min mass [GeV/c2] :")
        .appendField(new Blockly.FieldNumber(0, 0, Infinity, 0.0001), "mass0");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Max mass  [GeV/c2] :")
        .appendField(new Blockly.FieldNumber(0, 0, Infinity, 0.0001), "mass1");
    //this.appendValueInput("histogram").setCheck("histogram").appendField("Histogram");
    this.appendDummyInput().appendField("Histograms");
    this.appendStatementInput("histogram")
        .setCheck("histogram");
    this.setInputsInline(false);
    this.setOutput(true, "particle list");
    this.setColour(120);
    this.setTooltip('Combine two particles in the new particle by making combinations between particles in two input lists. If the input connector is empty, the full particle list will be used');
    this.setHelpUrl('https://belle2.ijs.si/public/help/');
  }
};

Blockly.Blocks['particle_combiner3'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Combine 3 particles");
    this.appendValueInput("list1")
        .setCheck("particle list")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Particle 1");
    this.appendValueInput("list2")
        .setCheck("particle list")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Particle 2");
    this.appendValueInput("list3")
        .setCheck("particle list")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Particle 3");
    this.appendDummyInput()
        .appendField("Same particle lists?")
        .appendField(new Blockly.FieldDropdown([["No", "0"], ["Yes", "1"]]), "sameparticles");
    this.appendDummyInput()
        .appendField("Set identity to")
       .appendField(new Blockly.FieldDropdown([["electron", "ELECTRON"], ["muon", "MUON"], ["pion", "PION"], ["kaon", "KAON"], 
                                                  ["proton", "PROTON"], ["photon", "PHOTON"], ["Phi meson", "PHI"], ["D meson", "D"], 
                                                  ["D* meson", "DSTAR"], ["J/Psi meson", "JPSI"],["B meson","B"], ["Lambda 0","LAMBDA0"], ["do not set","ALL"]]), "simplepid");

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Min mass [GeV/c2] :")
        .appendField(new Blockly.FieldNumber(0, 0, Infinity, 0.0001), "mass0");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Max mass  [GeV/c2] :")
        .appendField(new Blockly.FieldNumber(0, 0, Infinity, 0.0001), "mass1");
    //this.appendValueInput("histogram").setCheck("histogram").appendField("Histogram");
    this.appendDummyInput().appendField("Histograms");
    this.appendStatementInput("histogram")
        .setCheck("histogram");
    this.setInputsInline(false);
    this.setOutput(true, "particle list");
    this.setColour(0);
    this.setTooltip('Combine three particles in the new particle by making combinations between particles in three input lists. If the input connector is empty, the full particle list will be used');
    this.setHelpUrl('https://belle2.ijs.si/public/help/');
  }
};


Blockly.Blocks['particle_selector'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Select Particles");
    this.appendValueInput("list1")
        .setCheck("particle list")
        .appendField("Particle");
    this.appendDummyInput()
        .appendField("Charge")
        .appendField(new Blockly.FieldDropdown([["-1", "-1"], ["0", "0"], ["1", "1"], ["Any", "2"]]), "chargelist");
    this.appendDummyInput()
        .appendField("Type")
       .appendField(new Blockly.FieldDropdown([["electron", "ELECTRON"], ["muon", "MUON"], ["pion", "PION"], ["kaon", "KAON"], 
                                                  ["proton", "PROTON"], ["photon", "PHOTON"], ["Phi meson", "PHI"], ["D meson", "D"], 
                                                  ["D* meson", "DSTAR"], ["J/Psi meson", "JPSI"],["B meson","B"],["all particles","ALL"]]), "simplepid");
    //this.appendValueInput("histogram").setCheck("histogram").appendField("Histogram");
    this.appendDummyInput().appendField("Histograms");
    this.appendStatementInput("histogram")
        .setCheck("histogram");
    this.setInputsInline(false);
    this.setOutput(true, "particle list");
    this.setColour(65);
    this.setTooltip('Create a new list of particles based on the input particle list. If the input is empty, all the particles in the event are used.');
    this.setHelpUrl('https://belle2.ijs.si/public/help/');
  }
};

Blockly.Blocks['histogram_creator'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Histogram");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Title")
        .appendField(new Blockly.FieldTextInput("Reconstructed Mass"), "name");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Number of bins")
        .appendField(new Blockly.FieldNumber(40, 0), "nbins");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Min:")
        .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity, 0.0001), "min");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Max:")
        .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity, 0.0001), "max");
    this.appendDummyInput()
        .appendField("Variable")
        .appendField(new Blockly.FieldDropdown([["mass", "GetMass"], ["momentum", "GetMomentum"], ["energy", "GetEnergy"],["charge", "GetCharge"], ["identity", "GetPid"],["polar angle", "GetTheta"],["cos(polar ang.)", "GetCosTheta"],["px", "GetXMomentum"],["py", "GetYMomentum"],["pz", "GetZMomentum"],["pT", "GetTransverseMomentum"]]), "varname");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(20);
    this.setTooltip('This block handles the histogram creation and filling. Define a number of bins, minimum and maximum of the range and assign a variable to plot');
    this.setHelpUrl('https://belle2.ijs.si/public/help/');
  }
};

Blockly.Blocks['simple_analysis'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Belle II Masterclass");
    this.appendDummyInput()
        .appendField("Number of events: ")
        .appendField(new Blockly.FieldNumber(5000, 0), "neve");
    this.appendDummyInput()
        .appendField("First event: ")
        .appendField(new Blockly.FieldNumber(0, 0), "first");
    this.appendDummyInput()
        .appendField("Data Source")
        .appendField(new Blockly.FieldDropdown([["hadron-1", "1"], ["hadron-2", "2"]]), "datasource");
    this.appendDummyInput()
        .appendField("Print particle list?")
        .appendField(new Blockly.FieldDropdown([["No", "0"], ["Yes", "1"]]), "print");
    this.appendValueInput("list")
        .setCheck("particle list")
        .appendField("Particle List");
    this.setColour(230);
    this.setTooltip('Run the analysis, specify data source, number of events, first event and a list of particles to process.');
    this.setHelpUrl('https://belle2.ijs.si/public/help/');
  }
};

Blockly.Blocks['particle_mass_fix'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Particle mass fix");
    this.appendValueInput("list")
        .setCheck("particle list")
        .appendField("Particle List");
    this.setOutput(true, "particle list");
    this.setColour(150);
    this.setTooltip('');
    this.setHelpUrl('https://belle2.ijs.si/public/help/');
  }
};

Blockly.Blocks['primary_list'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Stored Particles:");
    this.appendValueInput("histogram")
        .setCheck("histogram")
        .appendField("Histogram:");
    this.setInputsInline(true);
    this.setOutput(true, "particle list");
    this.setColour(180);
    this.setTooltip('Create a list of primary particles, if not used, the primary particles are used in the empty particle list connectors');
    this.setHelpUrl('https://belle2.ijs.si/public/help/');
  }
};
