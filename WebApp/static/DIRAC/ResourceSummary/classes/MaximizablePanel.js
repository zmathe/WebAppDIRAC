function ki(w){
    console.log(w.getTitle());
}
Ext.define("DIRAC.ResourceSummary.classes.MaximizablePanel", {
    extend : "Ext.panel.Panel",
    tools : [{
          type : 'maximize',
          tooltip : 'Maximize the application.',
          handler : function(event, toolEl, panelHeader) {
            var me = this;

            var widget = me.up("panel");
            var parent = me.up("panel").parentWidget;
            for (var i = 0; i < widget.tools.length; i++) {
              if (widget.tools[i].type == 'maximize' || widget.tools[i].type == 'close' || widget.tools[i].type == "collapse-right") {
                widget.tools[i].hide();
              } else if (widget.tools[i].type == 'minimize') {
                widget.tools[i].show();
              }
            }
            
            parent.suspendLayout = true;
            
            widget.savedWidth = widget.getWidth();
            widget.savedHeight = widget.getHeight();
            widget.savedColumnWidth = widget.columnWidth;
            widget.setWidth(parent.getWidth()-3);
            widget.setHeight(parent.getHeight()-3);
            widget.columnWidth = undefined;
            
            //widget.setHeight(widget.maximizedSize.height);
            //widget.setWidth(widget.maximizedSize.width);
            parent.items.each(function(sibling){
                if(sibling != widget){
                    sibling.hide();
                }
            });
            parent.suspendLayout = false;
            parent.updateLayout();
          }
        }, {
          type : 'minimize',
          tooltip : 'Minimize the application.',
          hidden : true,
          handler : function(event, toolEl, panelHeader) {
            var me = this;

            var parent = me.up("panel").parentWidget;
            var widget = me.up("panel");


            for (var i = 0; i < widget.tools.length; i++) {
              if (widget.tools[i].type == 'maximize' || widget.tools[i].type == 'close' || widget.tools[i].type == "collapse-right") {
                widget.tools[i].show();
              } else if (widget.tools[i].type == 'minimize') {
                widget.tools[i].hide();
              }
            }
            
            parent.suspendLayout = true;
            parent.items.each(function(sibling){
                if(sibling != widget){
                    sibling.show();
                }
            });
            widget.columnWidth = widget.savedColumnWidth;
            widget.setWidth(widget.savedWidth);
            widget.setHeight(widget.savedHeight);
            parent.suspendLayout = false;
            parent.updateLayout();
            //widget.setHeight(widget.height);
            //console.log(widget.savedWidth);
            //widget.setWidth(widget.savedWidth);
          }
        }]
  });
