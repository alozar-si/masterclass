Blockly.JavaScript['particle_combiner'] = function(block) {
  var value_list1 = Blockly.JavaScript.valueToCode(block, 'list1', Blockly.JavaScript.ORDER_ATOMIC);
  var value_list2 = Blockly.JavaScript.valueToCode(block, 'list2', Blockly.JavaScript.ORDER_ATOMIC);
  var value_pid = Blockly.JavaScript.valueToCode(block, 'pid', Blockly.JavaScript.ORDER_ATOMIC);
  var number_mass0 = block.getFieldValue('mass0');
  var number_mass1 = block.getFieldValue('mass1');
  var value_histogram = Blockly.JavaScript.valueToCode(block, 'histogram', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['particle_selector'] = function(block) {
  var value_list1 = Blockly.JavaScript.valueToCode(block, 'list1', Blockly.JavaScript.ORDER_ATOMIC);
  var value_charge = Blockly.JavaScript.valueToCode(block, 'charge', Blockly.JavaScript.ORDER_ATOMIC);
  var value_type = Blockly.JavaScript.valueToCode(block, 'type', Blockly.JavaScript.ORDER_ATOMIC);
  var value_histogram = Blockly.JavaScript.valueToCode(block, 'histogram', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['particle'] = function(block) {
  var dropdown_pidlist = block.getFieldValue('pidlist');
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['histogram_creator'] = function(block) {
  var text_name = block.getFieldValue('name');
  var number_nbins = block.getFieldValue('nbins');
  var number_min = block.getFieldValue('min');
  var number_max = block.getFieldValue('max');
  // TODO: Assemble JavaScript into code variable.
  var code = 'histogram(' + text_name + ', nbins ' + number_nbins + ', min ' + number_min +  ', max ' + number_max + ')\n';
  //var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['charge'] = function(block) {
  var dropdown_chargelist = block.getFieldValue('chargelist');
  // TODO: Assemble JavaScript into code variable.
  var code = 'charge()\n';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['simple_analysis'] = function(block) {
  var number_neve = block.getFieldValue('neve');
  var number_first = block.getFieldValue('first');
  var dropdown_datasource = block.getFieldValue('datasource');
  var value_list = Blockly.JavaScript.valueToCode(block, 'list', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'simple_analysis(' + ' neve ' + number_neve ' + ' first ' + number_first  +  ' datasource ' + dropdown_datasource + ' list ' + value_list + ')\n';
  //var code = '...';
  return code;
};

Blockly.JavaScript['particle_mass_fix'] = function(block) {
  var value_list = Blockly.JavaScript.valueToCode(block, 'list', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['primary_list'] = function(block) {
  var value_histogram = Blockly.JavaScript.valueToCode(block, 'histogram', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'primary_list(' + value_histogram + ')\n';
  //var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
