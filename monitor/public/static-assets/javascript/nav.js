// Don't load url with Ajax in jquery.ui.tabs
(function( $, undefined ) {
     $.widget( "ui.tabs", $.ui.tabs, {
                   load: function(){
                       this.element.dequeue( "tabs" );
                   }
               });
     
 })( jQuery );

$(document).ready(function () {
                      
                      var openUrlOnTabs = function(url,  label) {
                          // $('#tabs').tabs("add", url, label);

                          $( "<li><a href=" + url + ">" + label + "</a><span class='ui-icon ui-icon-close'>Remove Tab</span></li>")
                          // $("<li><a href='#{url}' src='#{url}'>#{label}</a><span class='ui-icon ui-icon-close'>Remove Tab</span></li>")
                              .appendTo( "#tabs .ui-tabs-nav" );
                          $( "#tabs" ).tabs( "refresh" );
                          var length = $( "#tabs ul li" ).length;
                          $( "#tabs" ).tabs( { active: length - 1 });
                      };

                      var resizeIframe = function(layout, panel){
                          var padding = 6;
                          var tabIframeHeight =  layout.state.center.innerHeight - $("#tabs ul.ui-tabs-nav").outerHeight() - $("body section.ui-layout-center div.right_top_header").outerHeight() -  padding;
                          var tabIframeWidth = $("#tabs ul.ui-tabs-nav").innerWidth() -  padding ;
                          var paddings = [padding, 0, 0,padding];
                          panel.css("padding",paddings.join("px ")+"px");
                          panel.width(tabIframeWidth);
                          panel.height(tabIframeHeight);
                          
                      };
                      var $layout = $('body').layout({ 
                           applyDefaultStyles: true,
                           west: {
                               size: 200,
                               minSize: 160
                           },
                           south: {
                               size: 20,
                               resizable: false,
                               closable: false
                           },
                           west__onresize:  function(){
                               $('body aside').accordion('resize');
                           },
                           center__onresize: function(){
                               $("#tabs iframe").each(function(){
                                                        resizeIframe($layout, $(this));
                                                      });
                           }
                       });

                      $('#accordion').accordion({fillSpace: true});

                      $('#tabs').tabs({
                        beforeActivate: function( event, ui ) {
                          var tab = $('a', ui.newTab);
                          var url = tab.attr('href');
                          if(ui.newPanel.prop("tagName").toLowerCase()=="div") {
                            var html = $("<div/>").append(ui.newPanel.clone()).html();
                            var newElement = html.replace(/^<div/, "<iframe").replace(/<\/div>$/, "</iframe>").replace("display: none;", "display: block");
                            var newNode = $.parseHTML(newElement);
                            $(newNode).attr("src", url);
                            $(newNode).replaceAll(ui.newPanel);
                            resizeIframe($layout, $(newNode));
                          }
                        },
                        create: function(event,ui){
                          var panel = $(ui.panel);
                          resizeIframe($layout, panel);
                        }
                      });
                      
                      resizeIframe($layout,$("#welcome"));

                      $("#accordion nav a").on("click", function(event){
                                                     event.preventDefault();
                                                     var me = $(this);
                                                     var url = me.attr('href');
                                                     var label = me.text();
                                                     openUrlOnTabs(url, label);
                                                 });

                      $(document).on("click", "#tabs span.ui-icon-close", function() {
                        var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
                        $( "#" + panelId ).remove();
                        $( "tabs" ).tabs( "refresh" );
		                  });

                        $("#restart_gameserver").on("click", function() {
                            var url = $("#restart_gameserver").attr('url');
                            openUrlOnTabs(url, "Query Restart GameServer");
                        });

                        $("#restart_external_gameserver").on("click", function() {
                            var url = $("#restart_external_gameserver").attr('url');
                            openUrlOnTabs(url, "Query Restart GameServer");
                        });

                        $("#update_configures").on("click", function() {
                            var url = $("#update_configures").attr('url');
                            openUrlOnTabs(url, "Query Update Configures");
                        });

                        $("#update_external_configures").on("click", function() {
                            var params = [];
                            var configfilename = $("#config_file_name").val();
                            configfilename = encodeURI(configfilename);
                            params.push(["configfilename", configfilename].join("="));

                            var url = $("#update_external_configures").attr('url') + "?" + params.join("&");
                            openUrlOnTabs(url, "Query Update Configures");
                        });

                        $("#query_serverinfo").on("click", function() {
                            var url = $("#query_serverinfo").attr('url');
                            openUrlOnTabs(url, "Query ServerInfo");
                        });
                        
                        $("#view_combatreport_button").on("click", function() {
                            var params = [];
                            var queryType= $("#item_selected_type").val();
                            params.push(["querytype", queryType.toLowerCase()].join("="));
                            var serverid = $("#serverid").val();
                            serverid = encodeURI(serverid);
                            params.push(["serverid", serverid].join("="));
                            var stageid = $("#stageid").val();
                            stageid = encodeURI(stageid);
                            params.push(["stageid", stageid].join("="));
                            var battleid = $("#battleid").val();
                            battleid = encodeURI(battleid);
                            params.push(["battleid", battleid].join("="));
                            var url = $("#view_combatreport_button").attr('url') + "?" + params.join("&");
                            openUrlOnTabs(url, "View Combat Report");
                        });

                        $("#query_operversion").on("click", function() {
                            var url = $("#query_operversion").attr('url');
                            openUrlOnTabs(url, "Query OperVersion");
                        });

                        $("#update_oper_version").on("click", function() {
                            var params = [];
                            var oper_version = $("#oper_version").val();
                            oper_version = encodeURI(oper_version);
                            params.push(["oper_version", oper_version].join("="));
                            var url = $("#update_oper_version").attr('url') + "?" + params.join("&");
                            openUrlOnTabs(url, "Update Oper Version (" + oper_version + ")");
                        });

                        $("#query_gateserver").on("click", function() {
                            var url = $("#query_gateserver").attr('url');
                            openUrlOnTabs(url, "Query gateserver");
                        });

                        $("#delete_gateserver").on("click", function() {
                            var params = [];
                            var gateServerId = $("#bedelete_gateserver").val();
                            gateServerId = encodeURI(gateServerId);
                            params.push(["gateServerId", gateServerId].join("="));
                            var url = $("#delete_gateserver").attr('url') + "?" + params.join("&");
                            openUrlOnTabs(url, "delete gateserver (" + gateServerId + ")");
                        });

                        $("#query_all_dispatches").on("click", function() {
                            var url = $("#query_all_dispatches").attr('url');
                            openUrlOnTabs(url, "Query All Dispatches");
                        });

                        $("#dispatch_client").on("click", function() {
                            var params = [];
                            var clientDeviceId = $("#dispatch_client_device_id").val();
                            clientDeviceId = encodeURI(clientDeviceId);
                            params.push(["clientDeviceId", clientDeviceId].join("="));
                            var gateServerId = $("#dispatch_client_gateserver").val();
                            gateServerId = encodeURI(gateServerId);
                            params.push(["gateServerId", gateServerId].join("="));
                            var url = $("#dispatch_client").attr('url') + "?" + params.join("&");
                            openUrlOnTabs(url, "Dispatch Client (" + clientDeviceId + ")");
                        });

                        $("#whitelist_oper").on("click", function() {
                            var params = [];
                            var opertype = $("#whitelist_opertype").val();
                            params.push(["opertype", opertype].join("="));
                            var uids = $("#playerid_to_white_list").val();
                            params.push(["uids", uids].join("="));
                            var url = $("#whitelist_oper").attr('url') + "?" + params.join("&");
                            openUrlOnTabs(url, "white list");
                        });

                        $("#login_control").on("click", function() {
                            var params = [];
                            var allowLogin = $("#login_control_type").val();
                            params.push(["allowLogin", allowLogin].join("="));
                            var reason = '';
                            if (!Boolean(allowLogin === "AllowLogin"))
                              reason = $("#servermaintain_reason").val();
                            reason = encodeURI(reason);
                            params.push(["reason", reason].join("="));
                            var url = $("#login_control").attr('url') + "?" + params.join("&");
                            openUrlOnTabs(url, "login control");
                        });
                  });
