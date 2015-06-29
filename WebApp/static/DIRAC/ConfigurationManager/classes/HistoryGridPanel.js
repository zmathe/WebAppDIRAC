Ext.define('DIRAC.ConfigurationManager.classes.HistoryGridPanel', {
      extend : "Ext.grid.Panel",
      initComponent : function() {
        var me = this;
        me.store = Ext.create("Ext.data.Store", {
              remoteSort : false,
              fields : ["version", "commiter"],
              sorters : [{
                    property : 'version',
                    direction : 'DESC'
                  }],
              data : []
            });

        Ext.apply(me, {
              layout : "fit",
              columns : [{
                    header : "From",
                    width : 50,
                    sortable : false,
                    dataIndex : 'version',
                    renderer : me.renderFromSelect
                  }, {
                    header : "To / RB",
                    width : 50,
                    sortable : false,
                    dataIndex : 'version',
                    renderer : me.renderToSelect
                  }, {
                    header : "Version",
                    width : 200,
                    sortable : false,
                    dataIndex : 'version'
                  }, {
                    header : "Commiter",
                    width : 100,
                    sortable : false,
                    dataIndex : 'commiter'
                  }],
              dockedItems : [{
                    xtype : 'toolbar',
                    dock : 'bottom',
                    layout : {
                      pack : 'left'
                    },
                    items : [{
                          text : 'Cancel',
                          handler : me.__onCancel,
                          scope : me,
                          iconCls : "toolbar-other-close"
                        }],
                    defaults : {
                      margin : 3
                    }
                  }]
            })

        me.callParent(arguments);

      },
      __onCancel : function() {
        var me = this;

        me.fireEvent('cancelled', me);
      },

      renderFromSelect : function(value, metadata, record, rowIndex, colIndex, store) {
        return '<input type="radio" name="fromVersion" value="' + record.get('version') + '"/>';
      },

      renderToSelect : function(value, metadata, record, rowIndex, colIndex, store) {
        return '<input type="radio" name="toVersion" value="' + record.get('version') + '"/>';
      },
      afterRender : function() {
        var me = this;
        me.el.on('click', me.checkEnabledDiff, me);
      },
      initRadios : function() {
        var me = this;
        toObj = document.getElementsByName("toVersion");
        for (var i = 0; i < toObj.length; i++) {
          if (i == 0)
            toObj[i].checked = true;
          else
            toObj[i].checked = false;
        }
        fromObj = document.getElementsByName("fromVersion");
        for (var i = 0; i < fromObj.length; i++) {
          if (i == 1)
            fromObj[i].checked = true;
          else
            fromObj[i].checked = false;
        }
        /*
         * rollObj = document.versions.rollbackVersion; for( var i = 0; i<
         * rollObj.length; i++ ) { rollObj[ i ].checked = false; }
         */
        me.checkEnabledDiff();
      },
     
      checkEnabledDiff : function(toObj, fromObj, a, b, c) {

        var me = this;
        
        var toObj = document.getElementsByName("toVersion");
        var selectedTo = me.getSelectedIndex(toObj);

        var fromObj = document.getElementsByName("fromVersion");
        var selectedFrom = me.getSelectedIndex(fromObj);

        for (var i = 0; i < fromObj.length; i++) {
          if (i <= selectedTo)
            fromObj[i].style.visibility = "hidden";
          else
            fromObj[i].style.visibility = "visible";
        }
        for (var i = 0; i < toObj.length; i++) {
          if (i >= selectedFrom)
            toObj[i].style.visibility = "hidden";
          else
            toObj[i].style.visibility = "visible";
        }
      },
      getSelectedIndex : function(radioObj) {
        var radioLength = radioObj.length;
        if (radioLength == null)
          if (radioObj.checked)
            return 0;
        for (var i = 0; i < radioLength; i++) {
          if (radioObj[i].checked)
            return i;
        }
        return 0;
      }
    });