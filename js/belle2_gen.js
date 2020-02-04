
Blockly.JavaScript['particle_combiner'] = function(block) {
  var value_list1 = Blockly.JavaScript.valueToCode(block, 'list1', Blockly.JavaScript.ORDER_ATOMIC);
  if (value_list1.length==0) value_list1='""';
  var value_list2 = Blockly.JavaScript.valueToCode(block, 'list2', Blockly.JavaScript.ORDER_ATOMIC);
  if (value_list2.length==0) value_list2='""';
  var dropdown_simplepid = block.getFieldValue('simplepid');
  var dropdown_sameparticles = block.getFieldValue('sameparticles');
  var number_mass0 = block.getFieldValue('mass0');
  var number_mass1 = block.getFieldValue('mass1');
  var histograms = Blockly.JavaScript.statementToCode(block, 'histogram');
  var code = '{"combiner":{"list1":' + value_list1 + ',"list2":' +  value_list2 ;
      code += ',"sameparticles":"'+ dropdown_sameparticles +'","pid":"' + dropdown_simplepid ;
      code +=  '","m0":"' + number_mass0 +  '","m1":"' + number_mass1 + '","histogram":[' + histograms + ']}}\n';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['particle_combiner3'] = function(block) {
  var value_list1 = Blockly.JavaScript.valueToCode(block, 'list1', Blockly.JavaScript.ORDER_ATOMIC);
  if (value_list1.length==0) value_list1='""';
  var value_list2 = Blockly.JavaScript.valueToCode(block, 'list2', Blockly.JavaScript.ORDER_ATOMIC);
  if (value_list2.length==0) value_list2='""';
  var value_list3 = Blockly.JavaScript.valueToCode(block, 'list3', Blockly.JavaScript.ORDER_ATOMIC);
  if (value_list3.length==0) value_list3='""';
  var dropdown_simplepid = block.getFieldValue('simplepid');
  var dropdown_sameparticles = block.getFieldValue('sameparticles');
  var number_mass0 = block.getFieldValue('mass0');
  var number_mass1 = block.getFieldValue('mass1');
  var histograms = Blockly.JavaScript.statementToCode(block, 'histogram');
  var code = '{"combiner3":{"list1":' + value_list1 + ',"list2":' +  value_list2 + ',"list3":' +  value_list3 ;
      code += ',"sameparticles":"'+ dropdown_sameparticles +'","pid":"' + dropdown_simplepid ;
      code +=  '","m0":"' + number_mass0 +  '","m1":"' + number_mass1 + '","histogram":[' + histograms + ']}}\n';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['particle_selector'] = function(block) {
  var value_list1 = Blockly.JavaScript.valueToCode(block, 'list1', Blockly.JavaScript.ORDER_ATOMIC);
  if (value_list1.length==0) value_list1='""';
  var dropdown_chargelist = block.getFieldValue('chargelist');
  var dropdown_simplepid = block.getFieldValue('simplepid');
  var histograms = Blockly.JavaScript.statementToCode(block, 'histogram');
  var code = '{"selector":{"list1":' + value_list1 ; 
      code  += ',"charge":"' +  dropdown_chargelist ; 
      code  += '","pid":"' + dropdown_simplepid +  '","histogram":[' + histograms + ']}}\n';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['histogram_creator'] = function(block) {
  var text_name = block.getFieldValue('name');
  var number_nbins = block.getFieldValue('nbins');
  var number_min = block.getFieldValue('min');
  var number_max = block.getFieldValue('max');
  var dropdown_varname = block.getFieldValue('varname');
  var code = '{"h1d":{"varname":"'+ dropdown_varname + '",';
      code = code  + ' "name":"' +  text_name + '","nbins":"' + number_nbins + '",';
      code = code  + ' "min":"' + number_min +  '","max":"' + number_max + '"}}\n';
  return code;
};

Blockly.JavaScript['simple_analysis'] = function(block) {
  var number_neve = block.getFieldValue('neve');
  var number_first= block.getFieldValue('first');
  var number_print= block.getFieldValue('print');
  var dropdown_datasource = block.getFieldValue('datasource');
  var value_list = Blockly.JavaScript.valueToCode(block, 'list', Blockly.JavaScript.ORDER_ATOMIC);
  if (value_list.length==0) value_list='""';
  var code = '{"analysis":{"neve":"' + number_neve + '","first":"' + number_first + '","print":"' + number_print +  '","datasource":"' + dropdown_datasource + '","list":' + value_list + '}}\n';
  
  return code;
};

Blockly.JavaScript['particle_mass_fix'] = function(block) {
  var value_list = Blockly.JavaScript.valueToCode(block, 'list', Blockly.JavaScript.ORDER_ATOMIC);
  if (value_list.length==0) value_list='""';
  var code = '{"fix_mass":{"list":' + value_list + '}}\n';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['primary_list'] = function(block) {
  var value_histogram = Blockly.JavaScript.valueToCode(block, 'histogram', Blockly.JavaScript.ORDER_ATOMIC);
   if (value_histogram.length==0) value_histogram='""';
  var code = '{"primary":' +  '{"histogram":' + value_histogram + '}}\n';
  return [code, Blockly.JavaScript.ORDER_NONE];
};
