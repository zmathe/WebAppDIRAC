/***
 * It implements the size of the Grid Panel. This class is used by {@link Ext.dirac.utils.DiracPagingToolbar}.
 */
Ext.define('Ext.dirac.utils.DiracPageSizeCombo',{
  extend: 'Ext.form.field.ComboBox',
  requires : ['Ext.data.SimpleStore'],
  allowBlank : false,
  displayField : 'number',
  editable : false,
  maxLength : 4,
  maxLengthText : 'The maximum value for this field is 1000',
  minLength : 1,
  minLengthText : 'The minimum value for this field is 1',
  mode : 'local',
  store : new Ext.data.SimpleStore({
    fields : [ 'number' ],
    data : [ [ 25 ], [ 50 ], [ 100 ], [ 200 ], [ 500 ], [ 1000 ] ]
  }),
  triggerAction : 'all',
  value : 100,
  width : 50
});