const inputArray = [
    'lundi 09 janvier 2023\n' +
      ' \t\n' +
      ' \n' +
      '\t10h00 - 12h00\tSLEAI610 - ECUE - Mathématiques (S6)\tLicence 3 Miashs parcours Miage\tC4 Luc.\t \t \tCours\t41 étudiants\n' +
      ' \t\n' +
      ' \n' +
      '\t13h15 - 14h45\tEP2MC3AN - P2 Analyse 3\t<CiP2> CiP2 G4\tTD08 Luc.\t \t \tTD\t24 étudiants\n' +
      ' \t\n' +
      ' \n' +
      '\t15h00 - 16h30\tEP2MC3AN - P2 Analyse 3\t<CiP2> CiP2 G3\tTD08 Luc.\t \t \tTD\t23 étudiants\n' +
      '\n',
    'mercredi 11 janvier 2023\n' +
      ' \t\n' +
      ' \n' +
      '\t14h45 - 17h15\tEIEIIH8 - SI4 IHM&Création monde virtuel\t<SI4> S8 G3-A\n' +
      '<SI4> S8 G3-B\n' +
      '<SI4> S8 IHM&virtuel (autres)\tE111 (O+111) Templiers 40 pl\t \t \tTD\t21 étudiants\n' +
      '\n',
    'vendredi 13 janvier 2023\n' +
      ' \t\n' +
      ' \n' +
      '\t08h00 - 10h00\tEIENVR9 - M5/SD Virtual reality\t<MAM5> MAM5 SD\tA233 (E+133) Templiers 32 pl\t3/2\t \tCours\t30 étudiants\n' +
      ' \t\n' +
      ' \n' +
      '\t10h15 - 11h45\tEIENVR9 - M5/SD Virtual reality\t<MAM5> MAM5 SD\tA242 (E+142) Templiers 66 pl\t \t \tTD\t30 étudiants'
  ];
  
  const outputArray = [];

  inputArray.forEach(element => {
    const date = element.split("\n")[0];
    const content = element.substring(element.indexOf("\n") + 1);
    outputArray.push({ date, content });
  });
  
  console.log(outputArray);
  