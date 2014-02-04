/***
 *  This widget can be used to create a selector. It allows to easily configure the selector. It provides all the methods which are needed to save/restore the widget state.
 *  The following example show how to create a selector:
 *
 *
 *      me.leftPanel = new Ext.create('Ext.dirac.utils.DiracBaseSelector',{
 *        scope : me,
 *        cmbSelectors : selectors,
 *        textFields : textFields,
 *        datamap : map,
 *        url : "TransformationMonitor/getSelectionData"
 *      });
 *
 *
 *  Parameters:
 *
 *    -scope: the parent widget. We have some functionalities which required access to the main class.
 *    -cmbSelectors: It is a dictionary which contains the selector values. These are the selectors which will be seen as combo box. You can define a selector as the
 *    following:
 *
 *     var selectors = {
 *          status : "Status",
 *          agentType : "Agent Type",
 *          type : "Type",
 *          group: "Group",
 *          plugin : "Plugin"
 *      };
 *
 *    -textFields is dictionary which contains the text field name and the text which will appears in the widget. The following example shows how to implement a text field:
 *
 *
 *      var textFields = {
 *          'transformationId' : "ProductionID(s)",
 *          'requestId'      : "RequestID(s)"
 *      }
 *
 *    -timeSearchPanel in case if we want to have the time selector.
 *    -datamap is a list which contains the map, because we may have a situation when the name is different in the widget than the value which is returned by the controller.
 *
 *     var map = [ [ "agentType", "agentType" ], [ "productionType", "type" ], ["transformationGroup", "group"], ["plugin", "plugin"], ["prodStatus", "status"] ];
 *
 *    -url is a String which contains the url used to fill the selector widget.
 */
Ext.define('Ext.dirac.utils.DiracBaseSelector',{
  extend:'Ext.panel.Panel',
  requires : ['Ext.dirac.utils.DiracBoxSelect', 'Ext.dirac.utils.DiracTextField', 'Ext.dirac.utils.DiracTimeSearchPanel'],
  title : 'Selectors',
  region : 'west',
  floatable : false,
  margins : '0',
  width : 250,
  minWidth : 230,
  maxWidth : 350,
  bodyPadding : 5,
  layout : 'anchor',
  autoScroll : true,
  /**
   * @cfg{Object}cmbSelectors
   * It stores the combo box selectors.
   */
  cmbSelectors : {},
  /***
   * @cfg{Object} textFields
   * It stores the text field selectors.
   */
  textFields : {},
  /***
   * @cfg{Ext.dirac.utils.DiracTimeSearchPanel} timeSearchPanel
   * It stores the time panel.
   */
  timeSearchPanel : null,
  /***
   * @property{Boolean} hasTimeSearchPanel
   * It is used to add/remove the time search panel to the selector. The time selector is available by default.
   */
  hasTimeSearchPanel : true,
  /***
   * @cfg{List} datamap
   * It contains the map in case when the selector name is different than the returned value.
   */
  datamap : [],
  /***
   * @cfg{String} url
   * This url used to fill the selectors.
   */
  url : "",
  /***
   * @cfg{Ext.menu.Menu} selectorMenu
   * This menu used to hide and show the selector widgets.
   */
  selectorMenu : null,
  constructor : function(oConfig){
    var me = this;
    me.callParent(arguments);

    if (oConfig.datamap == null){
      GLOBAL.APP.CF.log("error","The datamap must be given!!!");
      return;
    }
    if (oConfig.url == null){
      GLOBAL.APP.CF.log("error", "You have to provide an URL used to fill the selectors!");
      return;
    }
    if (oConfig.cmbSelectors){
      for ( var cmb in oConfig.cmbSelectors) {

        me.cmbSelectors[cmb] = Ext.create('Ext.dirac.utils.DiracBoxSelect', {
          fieldLabel : oConfig.cmbSelectors[cmb],
          queryMode : 'local',
          labelAlign : 'top',
          displayField : "text",
          valueField : "value",
          anchor : '100%'
        });

      }
    }
    if (oConfig.hasTimeSearchPanel != null){
      me.hasTimeSearchPanel = oConfig.hasTimeSearchPanel;
    }
    if (me.hasTimeSearchPanel){
      me.timeSearchPanel = Ext.create("Ext.dirac.utils.DiracTimeSearchPanel");
    }

    if (oConfig.textFields){
      for (field in oConfig.textFields){
        me.textFields[field] = Ext.create("Ext.dirac.utils.DiracTextField",{fieldLabel: oConfig.textFields[field],oprLoadGridData:me.oprLoadGridData});
      }
    }

    for(var selector in me.cmbSelectors){
      me.add(me.cmbSelectors[selector]);
    }
    me.add(me.timeSearchPanel);
    for (var field in me.textFields){
      me.add(me.textFields[field]);
    }
    //setting the selector menu
    var menuItems = [];
    for ( var cmb in me.cmbSelectors) {

      menuItems.push({
        xtype : 'menucheckitem',
        text : me.cmbSelectors[cmb].getFieldLabel(),
        relatedCmbField : cmb,
        checked : true,
        handler : function(item, e) {

          var me = this;

          if (item.checked)
            me.cmbSelectors[item.relatedCmbField].show();
          else
            me.cmbSelectors[item.relatedCmbField].hide();

        },
        scope : me
      });

    }

    menuItems.push({
      xtype : 'menucheckitem',
      text : "Time Span",
      checked : true,
      handler : function(item, e) {

        var me = this;

        if (item.checked)
          me.timeSearchPanel.show();
        else
          me.timeSearchPanel.hide();

      },
      scope : me
    });

    me.selectorMenu = new Ext.menu.Menu({
      items : menuItems
    });

    // Buttons at the top of the panel

    var oPanelButtons = new Ext.create('Ext.toolbar.Toolbar', {
      dock : 'bottom',
      layout : {
        pack : 'center'
      },
      items : []
    });

    me.btnSubmit = new Ext.Button({

      text : 'Submit',
      margin : 3,
      iconCls : "dirac-icon-submit",
      handler : function() {
        me.oprLoadGridData();
      },
      scope : me

    });

    oPanelButtons.add(me.btnSubmit);

    me.btnReset = new Ext.Button({

      text : 'Reset',
      margin : 3,
      iconCls : "dirac-icon-reset",
      handler : function() {
        me.oprResetSelectionOptions();
      },
      scope : me

    });

    oPanelButtons.add(me.btnReset);

    me.btnRefresh = new Ext.Button({

      text : 'Refresh',
      margin : 3,
      iconCls : "dirac-icon-refresh",
      handler : function() {
        me.oprSelectorsRefreshWithSubmit(false);
      },
      scope : me

    });

    oPanelButtons.add(me.btnRefresh);

    me.addDocked(oPanelButtons);

  },
  initComponent : function(){
    var me = this;
    me.bDataSelectionLoaded = false;
    me.callParent(arguments);
  },
  afterRender : function() {
    var me = this;
    me.getHeader().addTool({
      xtype : "diracToolButton",
      type : "down",
      menu : me.selectorMenu
    });
    me.__loadSelectorData();
    me.callParent();
  },
  /**
   * It returns the data which has to be saved in the User Profile.
   * @return{Object}
   */
  getStateData : function(){
    var me = this;

    // show/hide for selectors and their selected data (including NOT
    // button)
    var leftMenu = {};
    leftMenu.selectors = {};

    for ( var cmb in me.cmbSelectors) {

      leftMenu.selectors[cmb] = {
          hidden : me.cmbSelectors[cmb].isHidden(),
          data_selected : me.cmbSelectors[cmb].getValue(),
          not_selected : me.cmbSelectors[cmb].isInverseSelection()
      }

    }

    // the state of the selectors, text fields and time
    for (var field in me.textFields){
      leftMenu[field] = me.textFields[field].getValue();
    }


    leftMenu.cmbTimeSpan = me.getTimeSearch().timeSearchElementsGroup.cmbTimeSpan.getValue();
    leftMenu.calenFrom = me.getTimeSearch().timeSearchElementsGroup.calenFrom.getValue();
    leftMenu.cmbTimeFrom = me.getTimeSearch().timeSearchElementsGroup.cmbTimeFrom.getValue();
    leftMenu.calenTo = me.getTimeSearch().timeSearchElementsGroup.calenTo.getValue();
    leftMenu.cmbTimeTo = me.getTimeSearch().timeSearchElementsGroup.cmbTimeTo.getValue();
    leftMenu.timeSearchPanelHidden = me.getTimeSearch().hidden;
    return leftMenu;

  },
  /***
   * This function is used to load the data which is saved in the User Profile.
   * @param{Object}data
   * it contains the saved values.
   */
  loadState : function(data) {
    var me = this;

    var bToReload = false;

    if (data.leftMenu.selectors){
      for ( var i = 0; i < me.selectorMenu.items.length - 1; i++) {

        var item = me.selectorMenu.items.getAt(i);

        item.setChecked(!data.leftMenu.selectors[item.relatedCmbField].hidden);

        if (!data.leftMenu.selectors[item.relatedCmbField].hidden)
          me.cmbSelectors[item.relatedCmbField].show();
        else
          me.cmbSelectors[item.relatedCmbField].hide();

        /*
         * this can be done only if the store is being loaded, otherwise has
         * to be postponed
         */
        me.__oprPostponedValueSetUntilOptionsLoaded(me.cmbSelectors[item.relatedCmbField], data.leftMenu.selectors[item.relatedCmbField].data_selected,
            ((i == me.selectorMenu.items.length - 2) ? true : false));

        me.cmbSelectors[item.relatedCmbField].setInverseSelection(data.leftMenu.selectors[item.relatedCmbField].not_selected);

      }

    } else {

      bToReload = true;

    }

    // For the time span searching sub-panel
    var item = me.selectorMenu.items.getAt(me.selectorMenu.items.length - 1);

    item.setChecked(!data.leftMenu.timeSearchPanelHidden);

    if (!data.leftMenu.timeSearchPanelHidden)
      me.timeSearchPanel.show();
    else
      me.timeSearchPanel.hide();
    // END - For the time span searching sub-panel

    for (var field in me.textFields){
      me.textFields[field].setValue(data.leftMenu[field]);
    }

    me.getTimeSearch().timeSearchElementsGroup.cmbTimeSpan.setValue(data.leftMenu.cmbTimeSpan);
    me.getTimeSearch().timeSearchElementsGroup.calenFrom.setValue(data.leftMenu.calenFrom);

    me.getTimeSearch().timeSearchElementsGroup.cmbTimeFrom.setValue(data.leftMenu.cmbTimeFrom);
    me.getTimeSearch().timeSearchElementsGroup.calenTo.setValue(data.leftMenu.calenTo);
    me.getTimeSearch().timeSearchElementsGroup.cmbTimeTo.setValue(data.leftMenu.cmbTimeTo);

    if (bToReload) {

      me.oprLoadGridData();

    }

  },
  /***
   *@private
   *In case the selector is not loaded we have to postpone the setting of the value.
   *@param{Ext.dirac.utils.DiracBoxSelect} oSelectionBox the combo box widget
   *@param{Object}oValues the value which has to be set to the oSelectionBox
   *@param{Boolean} it used to cancel the previous request
   */
  __oprPostponedValueSetUntilOptionsLoaded : function(oSelectionBox, oValues, bLastOne) {

    var me = this;

    if (me.bDataSelectionLoaded) {

      if (bLastOne) {
        me.__cancelPreviousDataRequest();
        me.oprLoadGridData();
      }

      oSelectionBox.setValue(oValues);

    } else {

      Ext.Function.defer(me.__oprPostponedValueSetUntilOptionsLoaded, 1500, me, [ oSelectionBox, oValues, bLastOne ]);

    }

  },
  /***
   * @private
   * It cancel the AJAX request.
   */
  __cancelPreviousDataRequest : function() {

    var me = this;

    if (me.scope.grid.store.loading && me.score.grid.store.lastDataRequest) {
      var oRequests = Ext.Ajax.requests;
      for (id in oRequests) {
        if (oRequests.hasOwnProperty(id) && (oRequests[id].options == me.dataStore.lastDataRequest.request)) {
          Ext.Ajax.abort(oRequests[id]);
        }
      }
    }
  },
  /**
   * It return the Time search panel
   * @retun{Ext.dirac.utils.DiracTimeSearchPanel}
   */
  getTimeSearch : function(){
    var me = this;
    return me.timeSearchPanel;
  },
  /***
   * @private
   * It loads the Selector data using AJAX request.
   */
  __loadSelectorData : function(){
    var me = this;

    Ext.Ajax.request({
      url : GLOBAL.BASE_URL + me.url,
      params : {

      },
      scope : me,
      success : function(response) {

        var me = this;
        var response = Ext.JSON.decode(response.responseText);

        me.__oprRefreshStoresForSelectors(response, false);

        if (me.properties){
          if (me.scope.currentState == ""){
            if ("properties" in GLOBAL.USER_CREDENTIALS) {
              for (var i =0; i<me.properties.length;i++){
                if ((Ext.Array.indexOf(GLOBAL.USER_CREDENTIALS.properties, me.properties[i][0]) != -1) && (Ext.Array.indexOf(GLOBAL.USER_CREDENTIALS.properties, me.properties[i][1]) == -1)) {
                  me.cmbSelectors[me.properties[i][2]].setValue([ GLOBAL.USER_CREDENTIALS.username ]);
                }
              }
            }
          }

        }

        me.bDataSelectionLoaded = true;

      },
      failure : function(response) {

        Ext.dirac.system_info.msg("Notification", 'Operation failed due to a network error.<br/> Please try again later !');
      }
    });


  },
  /***
   * It refresh the selectors.
   * @param{Object}oData data used by the selectors.
   * @param{Boolean}bRefreshStores to create new store.
   */
  __oprRefreshStoresForSelectors : function(oData, bRefreshStores) {

    var me = this;

    for ( var j = 0; j < me.datamap.length; j++) {

      var dataOptions = [];
      for ( var i = 0; i < oData[me.datamap[j][0]].length; i++)
        dataOptions.push([ oData[me.datamap[j][0]][i][0], oData[me.datamap[j][0]][i][0] ]);

      if (bRefreshStores) {

        var oNewStore = new Ext.data.ArrayStore({
          fields : [ 'value', 'text' ],
          data : dataOptions
        });

        me.cmbSelectors[me.datamap[j][1]].refreshStore(oNewStore);

      } else {
        me.cmbSelectors[me.datamap[j][1]].store = new Ext.data.ArrayStore({
          fields : [ 'value', 'text' ],
          data : dataOptions
        });
      }

    }
  },
  /***
   * It returns the data which is selected by the user.
   * @return{Object}
   */
  getSelectionData : function(){
    var me = this;

    // if a value in time span has been selected
    var sStartDate = me.getTimeSearch().timeSearchElementsGroup.calenFrom.getRawValue();
    var sStartTime = me.getTimeSearch().timeSearchElementsGroup.cmbTimeFrom.getValue();
    var sEndDate = me.getTimeSearch().timeSearchElementsGroup.calenTo.getRawValue();
    var sEndTime = me.getTimeSearch().timeSearchElementsGroup.cmbTimeTo.getValue();

    var iSpanValue = me.getTimeSearch().timeSearchElementsGroup.cmbTimeSpan.getValue();

    if ((iSpanValue != null) && (iSpanValue != 5)) {

      var oNowJs = new Date();
      var oBegin = null;

      switch (iSpanValue) {
      case 1:
        oBegin = Ext.Date.add(oNowJs, Ext.Date.HOUR, -1);
        break;
      case 2:
        oBegin = Ext.Date.add(oNowJs, Ext.Date.DAY, -1);
        break;
      case 3:
        oBegin = Ext.Date.add(oNowJs, Ext.Date.DAY, -7);
        break;
      case 4:
        oBegin = Ext.Date.add(oNowJs, Ext.Date.MONTH, -1);
        break;
      }

      sStartDate = Ext.Date.format(oBegin, "Y-m-d");
      sEndDate = Ext.Date.format(oNowJs, "Y-m-d");
      sStartTime = Ext.Date.format(oBegin, "H:i");
      sEndTime = Ext.Date.format(oNowJs, "H:i");

    }


    // Collect data for filtration
    var extraParams = {
        limit : me.scope.grid.pagingToolbar.pageSizeCombo.getValue(),
        startDate : sStartDate,
        startTime : sStartTime,
        endDate : sEndDate,
        endTime : sEndTime
    };

    for (var i in me.cmbSelectors){
      var param = (me.cmbSelectors[i].isInverseSelection()) ? me.cmbSelectors[i].getInverseSelection().split(",") : me.cmbSelectors[i].getValue();
      //var param = (me.cmbSelectors[i].isInverseSelection()) ? me.cmbSelectors[i].getInverseSelection() : me.cmbSelectors[i].getValue();
      if (param.length!=0){
        extraParams[i] = Ext.JSON.encode(param);
      }

    }

    for (var i in me.textFields){
      var param = me.textFields[i].getValue().split(',')[0] != ""?me.textFields[i].getValue().split(','):[];
      //var param = me.textFields[i].getValue().split(',')[0] != ""?me.textFields[i].getValue():'';
      //extraParams[i] = param;

      if (param.length!=0){
        var interval = [];
        for (var j =0; j<param.length; j++){
          if (param[j].split("-").length>0){
            var intervalStart = parseInt(param[j].split("-")[0]);
            var intervalEnd = parseInt(param[j].split("-")[1]);
            for (var k = intervalStart; k<intervalEnd+1;k++){
              interval.push(k);
            }
          }
        }
        extraParams[i] = Ext.JSON.encode(interval);
      }else{
        extraParams[i] = Ext.JSON.encode(param);
      }
    }

    return extraParams;
  },
  /***
   * It loads data to the grid panel.
   */
  oprLoadGridData : function() {
    var me = this;


    if (me.__oprValidateBeforeSubmit()) {

      // set those data as extraParams in
      me.scope.grid.store.proxy.extraParams = me.getSelectionData();
      me.scope.grid.store.currentPage = 1;
      me.scope.grid.store.load();

      var oCheckbox = Ext.query("#" + me.scope.id + " input.dirac-table-main-check-box");
      if (oCheckbox.length>0){
        oCheckbox[0].checked = false;
      }

     if (me.scope.funcOnChangeEitherCombo){
       me.scope.funcOnChangeEitherCombo(); //if we have statistical window
     }
    }

  },
  /***
   * It validates the selected values. It is used to make sure the values which are selected are correct.
   */
  __oprValidateBeforeSubmit : function() {

    var me = this;
    var bValid = true;

    for (var field in me.textFields){
      if (!me.textFields[field].validate()){
        bValid = false;
        break;
      }
    }
    return bValid;
  },
  /***
   * It is used to reset the selectors.
   */
  oprResetSelectionOptions : function() {

    var me = this;
    for (var selector in me.cmbSelectors){
      me.cmbSelectors[selector].setValue([]);
    }

    for(var field in me.textFields){
      me.textFields[field].setValue("");
    }

    me.oprLoadGridData();

  },
  /***
   * It is used to refresh the selectors.
   * @param{Boolean} create a Ajax request and refresh the selectors.
   */
  oprSelectorsRefreshWithSubmit : function(bSubmit) {

    var me = this;

    if (bSubmit && !me.__oprValidateBeforeSubmit())
      return;

    me.body.mask("Wait ...");
    // this var is used to know whether the options in the select boxes have
    // been loaded or not
    me.bDataSelectionLoaded = false;
    Ext.Ajax.request({
      url : GLOBAL.BASE_URL + me.url,
      params : {

      },
      scope : me,
      success : function(response) {

        var me = this;
        var response = Ext.JSON.decode(response.responseText);
        me.__oprRefreshStoresForSelectors(response, true);
        me.body.unmask();
        if (bSubmit)
          me.oprLoadGridData();

        me.bDataSelectionLoaded = true;

      },
      failure : function(response) {

        Ext.dirac.system_info.msg("Notification", 'Operation failed due to a network error.<br/> Please try again later !');
      }
    });

  }
});