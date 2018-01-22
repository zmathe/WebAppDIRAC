Ext.define('Ext.dirac.utils.DiracBoxSelect', {
      extend : "Ext.form.field.Tag",
      requires : ["Ext.form.field.Tag"],
      filterPickList: true,
      multiSelect : true,
      isInverseSelection : function(){
        return false;
      }
    });