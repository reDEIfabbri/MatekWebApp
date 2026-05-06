# Technical Specification Document

**1\. Introduction**

* **Project Title**: Adaptív Matekgyakorló Rendszer

* **Document Version**: 0

* **Publication Date**: 2025.12.03.

* **Prepared by**: Kovács Mihály

* **Topic leader**: Lénárt Anett

**2\. Version history**

| \# |    Date     | Consultant | Topic                                  |
|:--:|:-----------:|:----------:|----------------------------------------|
| 00 | 2025.11.06. | T. Storcz  | Template generation                    |
| 01 | 2025.10.01. | A. Lénárt  | Project idea, Constraints for planning |
| 02 | 2025.10.08. | A. Lénárt  | Market research                        |
| 03 | 2025.10.15. | A. Lénárt  | Functional Specification               |

**3\. Purpose**

* **Purpose Statement**: Jelen dokumentum célja az Adaptív Matekgyakorló Rendszer technikai megvalósításának részletes
  leírása. Definiálja a rendszer architektúráját, az adatbázis szerkezetét, a komponensek közötti kommunikációt és a
  választott technológiákat, biztosítva a fejlesztés konzisztenciáját a "Self-Contained" (teljesen lokális)
  követelményeknek megfelelően.

* **Scope**: A dokumentum a rendszer MVP (Minimálisan Életképes Termék) verziójának technikai specifikációit
  tartalmazza, beleértve a Frontend (React), a Backend (Node.js) és az Adatbázis (SQLite) rétegeket.

**4\. System Overview**

* **System Description**: A rendszer egy egyoldalas webalkalmazás (SPA), amely lehetővé teszi 5. osztályos tanulók
  számára a matematikai gyakorlást adaptív nehézségi szinteken. A rendszer teljesen offline/lokális környezetben fut,
  internetkapcsolatot nem igényel a működéshez. Két fő felületből áll: Tanulói felület (gyakorlás, gamification) és
  Adminisztrátori felület (tartalomkezelés).

* **Architecture Overview**: A rendszer egy klasszikus 3-rétegű (3-tier) architektúrát követ, de "monolitikus"
  telepítési modellel (minden egy gépen fut).

    * Prezentációs réteg: React alapú SPA.

    * Üzleti Logika réteg: Node.js és Express.js alapú REST API.

    * Adatréteg: SQLite fájl alapú relációs adatbázis.

    * Fő kihívások: A legnagyobb technikai kihívást a rendszer teljesen lokális telepíthetőségének biztosítása jelenti (
      függőségek minimalizálása) és az adaptív algoritmus hatékony leképzése SQL lekérdezésekre.

* **Design options**:

| Tervezési Kérdés | Opció A (Választott) | Opció B (Elvetett)        | Indoklás a döntés mögött                                                                                                                                                                                                 |
|:-----------------|:---------------------|:--------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Adatbázis Típus  | SQLite (Relációs)    | Firestore (NoSQL / Cloud) | A projekt követelménye az internetfüggetlen működés. A Firestore (bár van emulátora) alapvetően felhő-alapú. A SQLite egyetlen fájlban tárol mindent, ami ideális a lokális futtatáshoz és a diplomamunka bemutatásához. |
| Backend Nyelv    | Node.js (Express)    | PHP (Laravel)             | A Node.js lehetővé teszi a JavaScript használatát mind a Frontend, mind a Backend oldalon (Full-Stack JS), ami csökkenti a kontextusváltást és egyszerűsíti a fejlesztést.                                               |
| API Architektúra | RESTful API          | GraphQL                   | Az MVP funkciói (CRUD, egyszerű lekérdezések) jól definiálhatóak REST végpontokkal. A GraphQL felesleges komplexitást hozna a jelenlegi adatmodellhez.                                                                   |

**5\. System Architecture**

* **High-Level Architecture Diagram**:

  ![][image1]

* **Component Descriptions**: Detailed descriptions of each major component.

    * **Component 1**: Frontend Kliens (Client App)

        * Leírás: React könyvtárral épített Single Page Application.

        * Felelősség: Felhasználói felület megjelenítése (UI), felhasználói interakciók kezelése, kommunikáció a
          Backenddel, matematikai képletek renderelése (KaTeX).

        * Interakciók: HTTP kéréseket küld a Backend API-nak (pl. POST /login, GET /tasks).

    * **Component 2**: Backend Szerver (API Server)

        * Leírás: Node.js környezetben futó Express.js szerver.

        * Felelősség: HTTP kérések fogadása, JWT hitelesítés, jogosultságkezelés, adaptív logika (következő feladat
          kiválasztása), adatbázis műveletek végrehajtása.

        * Interakciók: Fogadja a Frontend kéréseit, és SQL parancsokat küld az Adatbázisnak.

    * **Component 3**: Adatbázis (Data Store)
        * Leírás: SQLite adatbázis (.sqlite vagy .db fájl).
        * Felelősség: Perzisztens adattárolás (felhasználók, feladatok, statisztikák).
        * Interakciók: Válaszol a Backend SQL lekérdezéseire.

* **Component integration:**
    * Protokoll: HTTP/1.1
    * Adatformátum: JSON (JavaScript Object Notation).
    * Kommunikáció: Aszinkron REST hívások (fetch vagy axios használatával a kliens oldalon).
    * Biztonság: Minden védett végpont elérésekor a HTTP Authorization fejlécben egy Bearer Token (JWT) kerül
      átküldésre.

* **Data Flow**:

1. Opció: RESTful API (Választott)
    * Leírás: A kliens és a szerver közötti kommunikáció szabványos HTTP metódusokon (GET, POST, PUT, DELETE) és
      erőforrás-orientált URL-eken keresztül történik.
    * Pozitívumok:
        * Szabványos: Széles körben elterjedt, könnyen érthető és dokumentálható.
        * Cache-elhető: A GET kérések (pl. feladat szövege) könnyen gyorsítótárazhatók.
        * Állapotmentes (Stateless): A szerver nem tárol kliens állapotot a kérések között, ami egyszerűsíti a
          skálázást (még ha itt ez nem is elsődleges szempont).
        * Eszköz-támogatás: Kiváló támogatottság minden böngészőben és fejlesztői eszközben (pl. Postman).
    * Nehézségek:
        * Over-fetching/Under-fetching: Előfordulhat, hogy több adatot kapunk vissza, mint amire szükségünk van, vagy
          több kérést kell indítani a teljes adatkészlet összeállításához (pl. dashboard betöltésekor).
        * Indoklás a választáshoz: Az MVP funkciói (CRUD műveletek, egyszerű lekérdezések) tökéletesen illeszkednek a
          REST modellhez. A React és az Express.js ökoszisztémában ez a legtermészetesebb és leggyorsabban
          implementálható megoldás.
2. Opció: GraphQL
    * Leírás: Egy lekérdezés-alapú nyelv, ahol a kliens pontosan meghatározza, milyen adatokra van szüksége egyetlen
      végponton keresztül.
    * Pozitívumok:
        * Rugalmasság: A kliens pontosan azt kapja, amit kér, nincs felesleges adatátvitel.
        * Egyetlen végpont: Minden kérés egy URL-re megy, ami egyszerűsítheti a hálózati logikát.
    * Nehézségek:
        * Komplexitás: A szerver oldali implementáció (Schema definíció, Resolverek írása) és a kliens oldali
          integráció (pl. Apollo Client) bonyolultabb, mint egy egyszerű REST API.
        * Caching: A HTTP szintű cache-elés nehezebb, mivel minden kérés POST metódust használhat.
        * Indoklás az elvetéshez: Az adatmodellünk (5 tábla) és a felhasználói esetek (egyszerű lekérdezések) nem
          indokolják a GraphQL bevezetésével járó extra komplexitást és tanulási görbét a diplomamunka keretében.
3. Opció: WebSocket (Real-time)
    * Leírás: Folyamatos, kétirányú kapcsolat a kliens és a szerver között.
    * Pozitívumok:
        * Valós idejű: Azonnali adatfrissítés (pl. ha a tanár látni szeretné, éppen mit csinál a diák).
        * Alacsony késleltetés: Nincs HTTP handshake minden üzenetváltásnál.
    * Nehézségek:
        * Állapottartó (Stateful): A szervernek fenn kell tartania a kapcsolatokat, ami erőforrás-igényes lehet.
        * Bonyolult hibakezelés: A kapcsolat megszakadása és újracsatlakozása komplex logikát igényel.
        * Indoklás az elvetéshez: Az alkalmazás természete (feladatmegoldás) alapvetően nem igényel valós idejű push
          értesítéseket. A felhasználó interakciója (válasz beküldése) jól kezelhető a hagyományos kérés-válasz
          modellel.

**A. Feladatmegoldás folyamata (UC-100)**

1. **Frontend:** A felhasználó beküldi a választ \---\> JSON objektum összeállítása \---\> POST /api/tasks/submit
   küldése.

2. **Backend:** Kérés fogadása \---\> JWT validálás \---\> Helyes válasz lekérése DB-ből \---\> Összehasonlítás \---\>
   Pontszám kalkuláció \---\> DB frissítése (UPDATE stats).

3. **Adatbázis:** Tranzakció végrehajtása \---\> Visszaigazolás.

4. **Backend:** Válasz JSON összeállítása (eredmény, új pontszám) \---\> Küldés a Frontendnek.

**B. Admin Tartalom Létrehozása (UC-200)**

1. **Frontend:** Admin kitölti az űrlapot \---\> POST /api/admin/tasks (tokennel).

2. **Backend:** Jogosultság ellenőrzése (role \=== 'ADMIN') \---\> Validálás \---\> INSERT INTO tasks.

3. **Adatbázis:** Új sor beszúrása \---\> ID visszaadása.

4. **Backend:** 201 Created válasz küldése.

System architecture component selections should be explained by listing possible options with their benefits, drawbacks
and the reason of final selections.

**6\. Data Design**

* **Data Model**: Az adatmodell 5 fő entitásból áll, amelyek közötti kapcsolatokat idegen kulcsok (Foreign Keys)
  biztosítják.

* **Database Schema**

    * Tábla: USERS
        * user\_id (PK, Integer): Egyedi azonosító.
        * email (Text, Unique): Felhasználónév.
        * password\_hash (Text): Titkosított jelszó.
        * role (Text): 'STUDENT' vagy 'ADMIN'.


* Tábla: TOPICS
    * topic\_id (PK, Integer): Témakör azonosító.
    * name (Text): Témakör neve.
* Tábla: TASKS
    * task\_id (PK, Integer): Feladat azonosító.
    * topic\_id (FK, Integer): Kapcsolat a TOPICS táblához.
    * difficulty (Real): Nehézségi szint (1.0 \- 10.0).
    * task\_text (Text): Feladat szövege (KaTeX).
    * correct\_answer (Text): Helyes válasz.
* Tábla: USER\_TOPIC\_STATS
    * stat\_id (PK, Integer): Statisztika azonosító.
    * user\_id (FK, Integer): Felhasználó.
    * topic\_id (FK, Integer): Témakör.
    * proficiency\_score (Real): Aktuális tudásszint (1-10).
    * Tábla: USER\_GLOBAL\_STATS
    * global\_id (PK, Integer): Azonosító.
    * user\_id (FK, Integer): Felhasználó.
    * lives (Integer): Életek száma.
    * current\_streak (Integer): Jelenlegi széria.

**7\. Interface Specifications**

* **User Interface (UI)**: A részletes Wireframe-ek a Funkcionális Specifikáció 7. pontjában és a
  mid\_fidelity\_wireframe.html fájlban találhatók.

    * Fő nézetek: Login, Dashboard, Task Screen, Admin Panel.

    * Stílus: shadcn/ui komponensek, Tailwind CSS-re építve, reszponzív ("Mobile-First") dizájn.


* **Application Programming Interface (API)**: A Backend a következő REST végpontokat biztosítja (prefix: /api):

    * Hitelesítés (Auth)

        * POST /auth/register: Új felhasználó regisztrálása.

        * POST /auth/login: Bejelentkezés, JWT token kérése.

    * Feladatok (Tasks)

        * GET /tasks/:topicId/new: Új, adaptív feladat kérése az adott témakörből (STUDENT).

        * POST /tasks/:taskId/submit: Válasz beküldése kiértékelésre (STUDENT).

    * Adminisztráció (Admin)

        * POST /admin/tasks: Új feladat létrehozása (ADMIN).

        * PUT /admin/tasks/:taskId: Feladat módosítása (ADMIN).

        * DELETE /admin/tasks/:taskId: Feladat törlése (ADMIN).

    * Statisztika (Stats)

        * GET /stats/dashboard: A bejelentkezett felhasználó összesített statisztikáinak lekérése.


* **External Interfaces**: Mivel a rendszer "Self-Contained", a külső függőségek minimálisak, de az alábbi
  interfészekkel kerül kapcsolatba:

    * Böngésző API (Browser API): A Frontend (React) a böngésző natív API-jait használja (pl. fetch a hálózati
      kommunikációhoz, localStorage a felhasználói beállítások ideiglenes tárolásához, DOM a megjelenítéshez).

    * Fájlrendszer (File System): A Backend (Node.js) közvetlenül a gazdagép fájlrendszerét használja az SQLite
      adatbázisfájl (.db) írására és olvasására. Nincs külön adatbázis szerver folyamat.

    * Operációs Rendszer (OS Environment): A Node.js futtatókörnyezet az operációs rendszeren keresztül éri el a
      hálózati portokat (alapértelmezetten a 3000 vagy 5000 portot a localhost-on).

**8\. Non-Functional Requirements**

* **Performance**: Az API válaszidő átlagosan 200ms alatt legyen lokális környezetben. A matematikai képletek
  renderelése (KaTeX) ne akassza meg a böngészőt.

* **Security**:

    * Jelszavak tárolása kizárólag hashelve (bcrypt).

    * API végpontok védelme JWT token alapú hitelesítéssel.
    * Bemeneti adatok validálása (Input Validation) az SQL Injection ellen.

* **Usability**: A felületnek "Mobile-Responsive"-nak kell lennie (telefonon és tableten is használható). A
  kontrasztarányok feleljenek meg az alapvető akadálymentesítési elveknek.

* **Reliability**: Az adatbázisnak konzisztensnek kell maradnia hiba esetén is (SQLite tranzakciók használata).

* **Scalability**: Bár lokális, a kód legyen moduláris (Controller-Service-Repository pattern), hogy később könnyen
  cserélhető legyen az adatbázis (pl. PostgreSQL-re), ha élesítésre kerülne a sor.

* **Compliance**: Legal and regulatory compliance requirements.

**9\. Technology Stack**

* **Programming Languages**: JavaScript (ES6+) egy nyelv a Frontend és Backend fejlesztéshez.

* **Frameworks and Libraries**:**Frontend:**

    * React (v18+), shadcn/ui (komponensek), Tailwind CSS (stílus), KaTeX (matek renderelés).

    * Backend**:** Node.js (futtatókörnyezet), Express.js (web szerver keretrendszer).
    * Adatbázis Driver**:** sqlite3 vagy better-sqlite3 a Node.js kapcsolathoz.
    * Biztonság**:** jsonwebtoken (JWT), bcrypt (hash), cors (Cross-Origin Resource Sharing).

* **Development Tools**:

    * IDE: Visual Studio Code.

    * Verziókövetés: Git és GitHub.

    * API Tesztelés: Postman vagy Thunder Client.

* **Deployment Environment**:

    * Hardver: Szabványos PC vagy Laptop (min. 4GB RAM).

    * Szoftver: Operációs rendszer (Windows/Linux/macOS), telepített Node.js Runtime.

    * Hálózat: Localhost (127.0.0.1), internet nem szükséges.

#### ***Technológiai Döntések Indoklása***

* **Miért SQLite?**
    * *Opciók:* SQLite (File-based), MySQL/PostgreSQL (Server-based).
    * *Döntés:* SQLite.
    * *Ok:* Nem igényel külön szerverfolyamatot telepíteni és konfigurálni, egyetlen fájlban tárolható, így a projekt
      könnyen mozgatható és bemutatható egy pendrive-on is, teljesítve a "Self-Contained" követelményt.
* **Miért React?**
    * *Opciók:* React, Vue, Angular, Vanilla JS.
    * *Döntés:* React.
    * *Ok:* A komponens-alapú felépítés ideális a Dashboard és a Feladat kártyák újrafelhasználhatósága miatt, és a
      modern webfejlesztés ipari standardja, ami a diplomamunka értékét növeli.
* **Miért Node.js?**
    * *Opciók:* Node.js, PHP, Python.
    * *Döntés:* Node.js.
    * *Ok:* A JSON alapú kommunikáció (ami a webes adatcsere alapja) natív a JavaScript környezetben, így nincs szükség
      bonyolult adatkonverzióra az adatbázis és a kliens között. Egységes nyelvet biztosít a teljes stacken.

Technology stack component selections should be explained by listing possible options with their benefits, drawbacks and
the reason of final selections.

[image1]: <data:image/png;base64,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NWwvjh6DX650LF2odBF322ob7UvHkwxqWcdz2wQTB+lK9ZqqrPzLlklE+vUb6ImA6tI9r3ptSUJef32MHR7TNsOGvWHrJFDutbhw4Rpb5l47Egv1dmm/kivVSVa074sXr9pzbNiwkXnggYeuyc/Dtt3UqfNDj8efoHTp9aPz1XnrmNqnyjW0KfHRa8I/BOl/Tad7LWSSLr12J02aZV57bXRCu969n7TrgwYNtz9dndpJ8PzSpX3odTphwoyE35V7zervxL1m9TiD5+GCdAFANoi9dOlC596U9ebbr98LXl3wDV/rTrqqMryoev2XHDym8uKLw2yPkNqo90gX0s8/328vFJs3f5X0HILH07oTKy3PnLnQq0s1vKiLvi74J05860XbuouolnfsOGovzGqX7vjqnSgr+y6hXMdS78V/ba4fT0M67njaf7rhqWKXrnSvKcnYnj3lCe2r8rwGX1vjx0/z6lMNL6pMYqFlSZb+GdCyetjcXEG10e8r+HoI7sufoHS56LyPH79s//HQuuTG/VPhj/av15eEZsOG3aF6Fydd6iVzcXXB5yP4OnWv/X37TibU6bnyS5f+jl2dpGzSpNl2OdlrNt3zgnQBQDaIvXRJEvy9OcE3b39brd+IdOkCG2yjSETUA6DlTp3usxcp107C9eyzLyUcUz+//PJr+1+5fz/u4pKsLpV0SfTUEybR80fCp3pdnNVroaEmyYP2oyHQceM+NO+/P922cVIxduwUs2jRWts74o4b7FXzi2Wy4yVLsUvXjbym/GXpntfga0tDj267qkiXv71+x67XS2Uaigv+foL78icoXRqWk9DpvCX+/nPRPxe1a9e2w9j+89I5dO7cxb6ugvt3ydTT5X8+/L2C2ka9f1qeM2dpwj7SSZfO3w19J3vNpntekC4AyAaxli43zKK5UHoDV9JdILWeDemSJLlyiZGW3brmjUiK/MfUT/WOOFHz12l7V+cfxkolXepZCAqaP5r74z8f/ZevOWIdO95lny+VzZu33Mqi2yY4vOiXLh0v2XOQLsUsXTf6mvKXpXteg6+tBQs+9barinQp99xzvxUmDS/722j74LbpEpQu7cM/3yl4LuoxUpl671y9ZKi8/HtvOD1Zbla61IOm7dat22kaN25i6tat59XdiHQFj5kuSBcAZINYS5d7c168eJ0XzUdyc2V0QTh8+Lxd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>