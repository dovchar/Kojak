var assert = require('assert'),
  fs = require('fs'),
  webdriver = require('selenium-webdriver'),
  test = require('selenium-webdriver/testing'),
  remote = require('selenium-webdriver/remote'),
  driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).
    build(),
  url = 'http://localhost:3000';
            
  driver.manage().timeouts().implicitlyWait(10000);        
    
  describe('Google Search', function() {  
    this.timeout(60000);
    before(function(done) {
      driver.get(url);
      driver.findElement(webdriver.By.tagName("body"))
        .then(function(){done();});
    });

    it('should append query to title', function(done) {
      for (var i = 0; i <= 5; i++ ) {
        driver.executeScript("kInst.takeCheckpoint();");
        
        driver.findElement(webdriver.By.id('new-todo')).sendKeys('webdriver item' + i);
        driver.findElement(webdriver.By.id('new-todo')).sendKeys(webdriver.Key.RETURN);
        
        driver.getTitle().then(function(title) {
          assert.equal('Backbone.js • TodoMVC', title);
        });
        
        driver.executeScript("kRep.funcPerfAfterCheckpoint();").then(function(){
          driver.sleep(1000).then(function(){ if(i===5) {done();}});
        });
      }
    });
    
    
    after(function(done) { 
      driver.quit()
        .then(function() {
          done();
        }); 
    });
  });
