# Project Kickoff Document

## 1\. Version history

| \# |    Date     | Consultant |                 Topic                  |
|:--:|:-----------:|:----------:|:--------------------------------------:|
| 00 | 2025.09.17. | T. Storcz  |       Templates for the projects       |
| 01 | 2025.10.01. | A. Lénárt  | Project idea, Constraints for planning |
| 02 | 2025.10.08. | A. Lénárt  |            Market research             |

## 2\. Introduction

* **Project Title**: Matek WebApp

* **Background**: Description of context and the main problem to solve.
* **Project Description**: Egy olyan webes alkalmazás kifejlesztése, amely az általános iskola 5. osztályos tanulóinak
  kínál interaktív matematika gyakorló feladatokat. Az alkalmazás célja, hogy a tanulók szórakoztató és oktató formában
  tudjanak gyakorolni, így fejlesztve a számolási és logikai képességeiket a tantárgyi követelményeknek megfelelően.
* **Business Objectives**: Egy minnél olcsóbb és elérhetőbb matek “edutainment” platform kialakítása általános
  iskolásoknak.
* **Scope Statement**: Tanulói és adminisztrátori felhasználói felületek kialakítása, minta feladat sorok implementálása
  az alábbi témakörökben:
    1. Számrendszerek
    2. Fejszámolás alapműveletekkel
    3. Írásbeli műveletek
    4. Írásbeli osztás
    5. Római számok
    6. Halmazok
    7. Kombinatorika
    8. Összeadás, kivonás az egészszámok halmazán
    9. Szorzás, osztás az egészszámok halmazán
    10. Számok abszolutértéke és ellentetje
    11. Arányosságok
    12. Nyitot mondatok
    13. Szöveges feladatok szimpla
    14. Szöveges feladatok komlpex
    15. Alap dimenziók
    16. Származtatott mértékegységek
    17. Törtek értelmezése
    18. Törtek összeadása, kivonása
    19. Törtek szorzása, osztása
    20. Tizedestörtek értelmezése
    21. Tizedestörtek összeadása, kivonása
    22. Tizedestörtek szorzása, osztása
    23. Kordináta-rendszerek és diagramok
    24. Geometriai axiómák, alapfogalmak
    25. Geometriai szerkesztések
    26. Sík geometriai számítások
    27. Tér geometriai 2D-s számítások
    28. Tér geometriai 3D-s számítások

## 3\. Project Goals and Objectives

* **Goals**: Gyermekek számára számára “szórakoztatóvá” tenni a matek tanulást
* **Objectives**: Minta feladat sorok kialakítása, amik mérhetően segítik egy gyermek megértését egy matematikai
  koncepcióval kapcsolatban. (Javulnak a statisztikái az oldal használata közben.)
* **Risks**: Kevés a tapasztalatom, így nehéz lesz átlátni a projekt egészét, még nem tudom, hogy költség mentesen meg
  lehetne-e oldani.

**4\. Project members**

* **Topic owner (stakeholder)**: Lénárt Anett
* **Technology consultant**: Lénárt Anett, ?
* **Project Manager**: Kovács Mihály?
* **Other members**:
    * **Role 1**: Kovács Mihály fejlesztő
    * **Role 2**: Kovács Mihály interjúztató
    * **Role 3**: Kovács Mihály tesztfelelős
    * Role 4: ismeretlen tesztalanyok
    * Role 5: ismeretlen interjú alanyok

## 5\. Project Deliverables

* **Major Deliverables**: List of key deliverables the project will produce.
    * **Deliverable 1**: Gépi kiértékelésű feladatsorok 5.-es korosztálynak
    * **Deliverable 2**: Kezelhető és osztályokba csoportosítható felhasználók
    * **Deliverable 3**: Felhasználói statisztikák követése, szintekbe sorolása (echelon rendszer)
    * **Deliverable 4**: Játék mechanizmusok a felhasználói statisztikákra építve (élet-széria-jutalom rendszer)
    * **Deliverable 5**: Admin/tanár felhasználók és kezelő felületek
    * **Deliverable 6**: Feladat sablonok
    * **Deliverable 7**: Felület ahol a feladatsablonok alapján létrelehet hozni új feladatokat
    * **Deliverable 8**: Osztály és echelon felület a versenyhelyzet kialakítására
* **Major system components**: list of business-related major components
    * **Component 1**: Server, skálázható megoldás szükséges, back end
    * **Component 2**: Adatbázis, szintén skálázható
    * **Component 3**: API, kliens oldali logika
    * **Component 4**: Kliens oldal, frontend

## 6\. Technology stack analysis

List and compare possible technology stack options of creating major deliverables. List their benefits and risks.

|            Stack Opció            |        Frontend         |       Backend / Szerver        |       Adatbázis       |                                                  Főbb Jellemző                                                   |
|:---------------------------------:|:-----------------------:|:------------------------------:|:---------------------:|:----------------------------------------------------------------------------------------------------------------:|
|  **1\. Self-Contained / Local**   |        **React**        |      **Node.js/Express**       | **SQLite** (Relációs) |                            **100%-ban lokális futtatás**, teljes kontroll, ingyenes.                             |
|     **2\. Serverless/Cloud**      |        **React**        | **Firebase** (Auth, Functions) | **Firestore** (NoSQL) |                  Gyors indítás, de **külső függést** és internetet igényelne a teszteléshez is.                  |
| **3\. Hagyományos / Monolitikus** | **Vanilla JS / JQuery** |       **PHP / Laravel**        |    **MySQL** (SQL)    | Széles körben elterjedt, megbízható technológia, de a beállítások komplexebbek lehetnek, mint a Node.js/Express. |

### Opció 1: React \+ Node.js/Express \+ SQLite (Self-Contained) \- Javasolt

| Előnyök (Benefits)                                                                                             | Kockázatok (Risks)                                                                                                                 |
|----------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| **Localhost & Futtathatóság: Nincs szükség internetre. A bemutatón is garantáltan fut.**                       | **Backend Kezelés:** Külön Node.js szervert (Express API) kell menedzselni a React fejlesztő szerver mellett. Több a konfiguráció. |
| **Költség: Teljesen Ingyenes. Nincs külső szolgáltatás díj.**                                                  | **Adatmodell:** A relációs adatbázis (SQLite) megköveteli a gondos tábla- és séma tervezést.                                       |
| **Adatkezelés: A SQLite (SQL) kiválóan alkalmas a komplex, relációs adatok (pl. Feladat-Témakör) tárolására.** | **Biztonság:** A saját hitelesítési logikát (JWT) kell megírni, ami több hibalehetőséget rejt, mint a beépített Auth rendszerek.   |
| **Teljes Kontroll: Teljes kontroll a backend logika és az API felett.**                                        | **Élesítés:** Ha később élesíteni kell, külön szerver hostingot kell fizetni (pl. DigitalOcean, AWS), ami havi költséget jelent.   |

### Opció 2: Serverless/Cloud (Firebase)

| Előnyök (Benefits)                                                                                               | Kockázatok (Risks)                                                                                                                   |
|------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| **Fejlesztési Sebesség: Beépített Authentication, Firestore real-time frissítések gyorsítják a kezdeti fázist.** | **Függőség:** **Külső API-ra** és internetkapcsolatra van szükség a fejlesztés és a futtatás során (a lokális emulátor ellenére is). |
| **Skálázás: Automatikus (serverless) megoldás. A növekedéssel együtt skálázódik manuális beavatkozás nélkül.**   | **Vendor Lock-in:** Erős kötődés a Google ökoszisztémához. Nehéz lehet később más szerverre átvinni.                                 |
| **Költség: Ingyenes Spark Plan az első komoly terhelésig, de a teszteléshez szükséges lehet éles környezet.**    | **Adatmodell:** A **NoSQL (Firestore)** adatbázis nehezebben kezeli a relációs (összekapcsolt) adatokat, mint a hagyományos SQL.     |

### Opció 3: PHP / Laravel \+ MySQL (Hagyományos)

| Előnyök (Benefits)                                                                                 | Kockázatok (Risks)                                                                                                                                                                                 |
|----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Megbízhatóság: Klasszikus webfejlesztési stack. A PHP évek óta stabilan fut.**                   | **Fejlesztési Sebesség:** A dinamikus (pl. valós idejű statisztika) frissítésekhez gyakran külön API hívásokat és extra JavaScript munkát igényel.                                                 |
| **Adatkezelés: A MySQL (SQL) robusztus és stabil, ideális a komplex, relációs adatok tárolására.** | **Futtatás:** A lokális futtatáshoz külön webszerver (pl. Apache/Nginx) és adatbázis szerver (MySQL) konfigurációja szükséges (pl. XAMPP/WAMP), ami több beállítási munkát jelent, mint a Node.js. |
| **Olcsó Hosting: A legolcsóbb tárhelyszolgáltatók is kínálnak PHP/MySQL alapú csomagokat.**        | **Modern UX:** A felhasználói élmény (UX) fejlesztése a Laravel sablonmotorjával nehezebb lehet, mint egy dedikált React felülettel.                                                               |

## 7\. Technology stack proposal

Based on this lightweight SWOT analysis of chapter 6, propose a full technology stack.

A projekt fő céljai (**alacsony költség**, **lokális futtathatóság**, **teljes kontroll**) alapján a **Self-Contained
Full-Stack** (Opció 1) a hivatalosan javasolt technológiai alap.

### **Javasolt Stack: React \+ Node.js/Express \+ SQLite**

Ez a stack biztosítja a **teljes függetlenséget**, a **leggyorsabb lokális fejlesztést** és a minimális menedzsment
igényt a külső API-k terén.

| Komponens                   | Konkrét Technológia                                         | Típus / Megjegyzés                                                                           |
|-----------------------------|-------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| **Frontend (Kliens oldal)** | **React** (Javascript) \+ **shadcn/ui** \+ **Tailwind CSS** | Interaktív, modern felhasználói felület és gyors, reszponzív dizájn.                         |
| **Backend & Szerver**       | **Node.js** (Express framework)                             | Lokális API szerver a frontend kiszolgálásához és a logikához.                               |
| **Adatbázis**               | **SQLite**                                                  | Fájl alapú, lokális, relációs adatbázis a tartalom, felhasználók és statisztikák tárolására. |
| **Hitelesítés**             | **JSON Web Tokens (JWT)**                                   | Session-ök és jogosultságok kezelése a saját backend szerveren.                              |
| **Verziókezelés**           | **Git / GitHub**                                            | A fejlesztés nyomon követése és a kód biztonságos tárolása.                                  |

## 8\. Project Timeline

### Milestones (Mérföldkövek)

* **Milestone 0: Piackutatás és Felhasználói Felmérés**
    * **Határidő:** 2025\. Október 31\.
    * **Deliverables:** Versenytárs Elemzés (min. 3 platform), Felhasználói Persona Vázlatok (Tanuló, Admin), Végleges *
      *top 5 Must-Have feature** lista. Feladat típúsok megállapítása, sablonok.
    * **Success Criteria:** Elemzés készül a kritikus hiányosságokról/lehetőségekről.
* **Milestone 1: Részletes Tervezés és Adatmodell**
    * **Határidő:** 2025\. December 01\.
    * **Deliverables:** Teljes Technikai Specifikáció, Kész **SQLite Relációs Adatmodell** (táblák és sémák), *
      *Feladatsablonok (Task Templates) Részletes Tervezése**, UI/UX Mockup-ok.
    * **Success Criteria:** Az Adatmodell minden szükséges mezőt tartalmaz a gamification és statisztikák követéséhez; a
      tervek jóváhagyása a Topic Owner részéről.
* **Milestone 2: Architektúra és Core Funkcionalitás**
    * **Határidő:** 2026\. Március 31\.
    * **Deliverables:** Működő Architektúra (React/Node.js/SQLite kapcsolat), Core **JWT-alapú** Authentication és
      Jogosultsági rendszer, **Feladat Motor (Task Engine) alaplogikája**, Admin felület a tartalom feltöltéséhez (
      minimalista MVP).
    * **Success Criteria:** A React frontend sikeresen kommunikál a Node.js API-val és a SQLite adatbázissal; a
      különböző felhasználók (Tanuló/Admin) eltérő felületet látnak a jogosultságaik alapján.
* **Milestone 3: Tartalom Implementáció és Kód-fagyasztás**
    * **Határidő:** 2026\. Április 30\.
    * **Deliverables:** Teljes Tartalmi Implementáció: Mind a **28 témakör** rendelkezik legalább 5-5 feladattal a
      rendszerben. A teljes Gamification logika (Élet/Széria/Jutalom) működik.
    * **Success Criteria:** Minden témakör feladatainak gépi kiértékelése hiba nélkül működik. A felhasználói Dashboard
      pontosan tükrözi az összes statisztikát. **Ez a pont jelenti a funkcionalitás lezárását (Kód-fagyasztás) a májusi
      tesztelés előtt.**
* **Milestone 4 (Kritikus): Tesztelés és Dokumentáció Vége**
    * **Határidő:** **2026\. Május 15\.**
    * **Deliverables:** Külső Béta tesztelési jegyzőkönyvek, Minden kritikus hiba kijavítva, a **diplomamunkához
      szükséges technikai dokumentáció** és a bemutató anyag (slide-ok) elkészítve.
    * **Success Criteria:** A béta tesztelők pozitív visszajelzése a felhasználói élményről. A teljes projektkód stabil
      és hibamentes, készen áll a bemutatásra.

### Schedule (Ütemezés: Fázisok és Tevékenységek)

* **Phase 1: Tervezés és Alapozás** (Kezdet: 2025\. Október 6\. / Vége: 2025\. December 1.)
    * Kulcs Tevékenységek: Piackutatás, UI/UX, **Relációs Adatmodell**, Technikai Specifikáció. (Lefedi az M0 és M1
      mérföldköveket.)
* **Phase 2: Technológiai Alapozás** (Kezdet: 2025\. December 2\. / Vége: 2026\. Január 31.)
    * Kulcs Tevékenységek: React, Node.js/Express és SQLite tanulása, Architektúra beállítása, JWT Auth konfigurálása.
* **Phase 3: Core Fejlesztés** (Kezdet: 2026\. Február 1\. / Vége: 2026\. Március 31.)
    * Kulcs Tevékenységek: Core Feladat Motor, Admin modul, Gamification (statisztikák) implementálása. (Lefedi az M2
      mérföldkövet.)
* **Phase 4: Bővítés és Tartalom** (Kezdet: 2026\. Április 1\. / Vége: 2026\. Április 30.)
    * Kulcs Tevékenységek: Az összes témakör (28) feladatainak feltöltése, UI/UX finomítás. **A funkcionalitás
      lezárása (Kód-fagyasztás).** (Lefedi az M3 mérföldkövet.)
* **Phase 5 (Kritikus) Tesztelés & Dokumentáció** (Kezdet: 2026\. Május 1\. / Vége: **2026\. Május 15\.**)
    * Kulcs Tevékenységek: Belső/Külső Béta Tesztelés, Hibajavítás, **Szakdolgozat-specifikus dokumentáció**
      véglegesítése. (Lefedi az M4 mérföldkövet.)

## 9\. Experiences and Risks

List all experiences related to the domain of the problem or the proposed technology stack.

Also list the risks based on lack of knowledge in these fields with the actions planned to avoid them.

### A. Kapcsolódó Tapasztalatok (Kovács Mihály)

| Terület                                    | Tapasztalat / Referencia                                                                                                | Relevancia a Projekthez                                                                                                                                            |
|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Weboldal Fejlesztés (Front-end Alapok)** | A szakkollégiumom, számára, a [www.serphicum.hu](https://www.serphicum.hu) weboldal létrehozása (HTML, Vanilla JS, CSS) | Alapvető ismeretek a webes megjelenítésről (HTML/CSS) és az interaktivitás (Vanilla JS) létrehozásáról. Ez az alapja a modern React fejlesztésnek.                 |
| **Akadémiai Projektvezetés**               | **Mérnökinformatikus szakos hallgató, diploma/szakdolgozati projekt.**                                                  | Biztosítja a projekt szigorú, dokumentált megközelítését, a minőségi elvárásokat és a határidők szigorú betartását, ami elengedhetetlen a sikeres diplomamunkához. |
| **Projektmenedzsment / Szervezés**         | A szakkollégium weboldalának projektvezetése és karbantartása, szakmán kívüliek bevonásával.                            | Képesség a feladatok ütemezésére, a határidők tartására és a technikai kihívások megoldására.                                                                      |

### B. Technológiai Kockázatok és Enyhítésük

A projekt sikeréhez szükséges technológiai stack (React, Node.js/Express, SQLite) új a fejlesztő számára, ami a
legnagyobb kockázatot jelenti.

| Kockázat (Risk)                         | A Tudáshiány Területe                                                                                    | Enyhítő Akció (Mit Tervezünk?)                                                                                                                                                                            |
|-----------------------------------------|----------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **R1: Full-Stack Újdonságok**           | A modern, komponens-alapú UI fejlesztés (React) és a Node.js/Express API egyidejű fejlesztése.           | **Phase 2 Fókusz:** Részletes Node/Express és React oktatóanyagok áttanulmányozása. Kisebb, gyakorló prototípusok fejlesztése a két szerver közötti kommunikáció tesztelésére (2025. Dec. – 2026\. Jan.). |
| **R2: SQLite Adatmodell Hibák**         | A relációs adatbázis (SQL) tervezésének igénye és a megfelelő lekérdezések írása.                        | **Milestone 1 Deliverable:** Extrém fókusz a **Relációs Adatmodell** gondos megtervezésére.                                                                                                               |
| **R3: Saját Hitelesítési Logika (JWT)** | A beépített szolgáltatás helyett saját biztonságos session/hitelesítési logika implementálása szükséges. | **Rendkívüli előkészület Phase 2-ben:** A JWT, sessionök és a jelszavak hashelésének (pl. bcrypt) alapos tanulmányozása a Node.js környezetben.                                                           |
| **R4: Túlkomplikált Task Engine**       | A feladatsablonok és a kiértékelési logika túl komplex megtervezése a kezdeti tapasztalatlanság miatt.   | **MVP Fókusz & Iteráció:** Csak az abszolút szükséges 2-3 sablont implementálni az MVP-hez (Milestone 2-ig). Folyamatos, apró lépésekben történő fejlesztés a teljes 28-as lista helyett.                 |

