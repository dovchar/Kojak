//Need jquery for sync.
//TODO: implement native ajax call with webworkers
Kojak.Sync = {
    syncData: function (data) {
      Kojak.Core.assert(Kojak.Config._SERVER_URL, 'server url not defined');
      
      var report = {report: data};
      
      $.ajax({
          type: 'POST',
          url: Kojak.Config._SERVER_URL + '/setFuncReport',
          crossDomain: true,
          data: report,
          dataType: 'json',
          success: function(responseData, textStatus, jqXHR) {
              //var value = responseData;
              console.log('Kojak Saas:' + textStatus);
          },
          error: function (responseData, textStatus, errorThrown) {
              console.log('post data to kojak saas is failed. ' + JSON.stringify(responseData));
          }
      });
    },
    
    syncNetData: function (data) {
      Kojak.Core.assert(Kojak.Config._SERVER_URL, 'server url not defined');
      
      var report = {report: data};
      
      $.ajax({
          type: 'POST',
          url: Kojak.Config._SERVER_URL + '/setNetReport',
          crossDomain: true,
          data: report,
          dataType: 'json',
          success: function(responseData, textStatus, jqXHR) {
              //var value = responseData;
              console.log('Kojak Saas:' + textStatus);
          },
          error: function (responseData, textStatus, errorThrown) {
              console.log('post data to kojak saas is failed. ' + JSON.stringify(responseData));
          }
      });
    },
    
    syncDataAfterCheckpoint: function (data) {
      Kojak.Core.assert(Kojak.Config._SERVER_URL, 'server url not defined');
      
      var report = {report: data};
      
      $.ajax({
          type: 'POST',
          url: Kojak.Config._SERVER_URL + '/setAfterCheckpoint',
          crossDomain: true,
          data: report,
          dataType: 'json',
          success: function(responseData, textStatus, jqXHR) {
              //var value = responseData;
              console.log('Kojak Saas:' + textStatus);
          },
          error: function (responseData, textStatus, errorThrown) {
              console.log('post data to kojak saas is failed. ' + JSON.stringify(responseData));
          }
      });
    }
};