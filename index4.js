const app = require("express")();

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: false,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    async function getInfo(teachers,ppromo=null,ggroup=null) {
      if(teachers != null){
        const browser = await puppeteer.launch(options);
        // Create a new page
        const page = await browser.newPage();
        await page.goto('http://sco.polytech.unice.fr/1/invite?fd=1', {waitUntil: 'domcontentloaded'});


        //Change type grid to list view
        let dropmenu=await page.waitForXPath(`//*[@id="GInterface.Instances[0]_secondMenu"]/div[1]/ul/li[1]`)
        await dropmenu?.$eval('ul', el => el.children[1].click());
  
        /*click on the menu(ENSEIGNANT)
        let menu=await page.waitForXPath(`//*[@id="GInterface.Instances[0]"]/div/div[3]`)
        await menu?.$eval('ul > li', el => el.click());*/
      
  
        
  
  
        var api=[];
        //Change enseignant name and get parse
        for (let i = 0; i<teachers.length; i++){
            var teacher = teachers[i]
            //Select search bar
            await page.waitForSelector('input[type=text]');
  
            //Change value of search bar
            await page.$eval('input[type=text]', (el,teacher) => { el.value = teacher; },teacher);
            //Press enter
            await (await page.$('input[type="text"]'))?.press('Enter');
            //time to load
            await page.evaluate(async() => {
                await new Promise(function(resolve) { 
                    setTimeout(resolve,500)
                });
            });
            

            let weekToClick = await page.waitForXPath(`//*[@id="GInterface.Instances[1].Instances[3]_Div_Calendrier"]/tbody/tr/td[37]`);
            // print  div on weekToClick*
            await weekToClick?.$eval('div', el => el.click());
            //await to load
            await page.evaluate(async() => {
                await new Promise(function(resolve) {
                    setTimeout(resolve,500)
                });
            });


            
            //Get table with info
            let HtmlTable=await page.waitForXPath(`//*[@id="GInterface.Instances[1].Instances[7]"]/div`);
  
            //get all emelent of table
            await page.evaluate(async() => {
                await new Promise(function(resolve) { 
                    setTimeout(resolve,100)
                });
            });
            try{
              var textInfo= await HtmlTable?.$eval('table', el => el.innerText);
            api.push({"teacher":teacher,"class":parseTable(textInfo)})
            //console.log(api)
            }
            catch(error){
              api.push({"teacher":teacher,"class":[]})
              //console.error(error)
            }
            
        }
  
          
        //close browser
        await browser.close();
  
        //return the table with all data
        //filter api if paremeter diffrent from null
        api2 = []
        if (api != null) {
          for (a in api) {
            t = api[a]["teacher"]
            c = api[a].class
            if(ppromo != null && ggroup != null) {
              ppromo = ppromo.toLowerCase()
              ggroup = ggroup.toLowerCase()
              apiFiltered = c?.filter(function(el){
                return el.promo?.toLowerCase().includes(ppromo) && el.group?.toLowerCase().includes(ggroup)
              });
            } else if(ppromo != null) {
              ppromo = ppromo.toLowerCase()
              apiFiltered = c?.filter(function(el){
                return el.promo?.toLowerCase().includes(ppromo)
              });
            } else if(ggroup != null) {
              ggroup = ggroup.toLowerCase()
              apiFiltered = c?.filter(function(el){
                return el.group?.toLowerCase().includes(ggroup)
              });
            } else {
              apiFiltered = c;
            }
            api2.push({teacher:t,class:apiFiltered})
          }
        } else {
          api2 = [{error:"pas de cours pour cette semaine"}]
        }
        api = api2
      }else{
        api = [{error:"parametre teacher is empty"}]
      }
      
      return api;
  }
  
  //(TD 01, TD 1...) TO TD1
  function cleanString(str) {
    if (!str) return "";
    str = str.replace(/TD[\s]?0+/g, "TD").replace(/TP[\s]?0+/g, "TP").replace(/G[\s]?0+/g, "G").replace(/TD[\s]+/g, "TD").replace(/TP[\s]+/g, "TP").replace(/G[\s]+/g, "G")
    return str;
  }
  
  
  
  //function that parse the table and return a json
  function parseTable(table){
     const days=["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]
     var effectiveDays=[]
     var separateDays=[]
     var res = []
  
     //Loop to determine the effective days (= the days on which there are classes)
     for ( let day of days){
          let index = table?.indexOf(day)
          if (index != -1){
              effectiveDays.push(index)
          }
     }
  
      //Loop to collect classes of each effective day
     for (let i = 0; i < effectiveDays.length; i++){
         separateDays.push(table?.slice(effectiveDays[i],effectiveDays[i+1]))
     }
     
  
    //if 2 \t\n, remove the 2nd one for parsing
    separateDays=separateDays.map(el =>{
  
      el = el.replace(/\t\t/g, "\t");
      return el
      })
  
      //console.log(separateDays);
  
     //Once we have all the classes of each day, we can parse them
     //We can manipulate the array like this : separateClasses[0][1] for the first day and the first class
     const separateClasses = separateDays.map(el =>
      el.split(/(\d{2}h\d{2} - \d{2}h\d{2})/g));
  
  
     //console.log(separateDays);
     
      //Loop to parse each class
      for (let i = 0; i<separateClasses.length; i++){
          for (let j = 2; j<separateClasses[i].length; j+=2){
              let classInfo = separateClasses[i][j].split("\t")
              let group = classInfo[2]?.match(/(TD|td)\s*\d+/) || classInfo[2]?.match(/(G|g)\d+/) || classInfo[2]?.match(/(TP|tp)\s*\d+/)  || "";
              group = cleanString(group[0])
              
    
              let Promo="";
              if(classInfo[2]?.includes("<")){
                const startIndex = classInfo[2]?.indexOf("<") + 1;
                const endIndex = classInfo[2]?.lastIndexOf("> ");
                Promo = classInfo[2]?.slice(startIndex, endIndex)||classInfo[2];
              }else{
                Promo = classInfo[2];
              }
  
              let classInfoJson = {
                  "day": separateClasses[i][0],
                  "time": separateClasses[i][j-1],
                  "name": classInfo[1],
                  "type":classInfo[2],
                  "room": classInfo[3],
                  "promo" :cleanString(Promo),
                  "group": group
              }
              res.push(classInfoJson)
          }
      }
     
      
      return res;
  }
  
  // check url parametres and convert to list
  teachers = (req.query.teachers) ? decodeURI(req.query.teachers).split(",") : null;
  ppromo = (req.query.promo) ? decodeURI(req.query.promo) : null;
  ggroup = (req.query.group) ? decodeURI(req.query.group) : null;
    (async () => {
      const api = await getInfo(teachers,ppromo,ggroup);
      res.send(api);
      //console.log(api)
    })()
  } catch (err) {
    console.error(err);
    return null;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;