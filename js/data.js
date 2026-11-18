/* =====================================================================
   CAMPAIGN DATA  (player-visible only — rebuilt after each session)
   To add a portrait: set img to a file path in img/ or a full https image URL.
   d: a 1–3 sentence description shown on the NPC and player cards and pop-ups.
   In a session summary, wrap words in [[double brackets]] to black them out
   until a player taps "Reveal the details" (works on the latest session).

   NPC CHARACTER SHEETS: give an NPC a `sheet` and its pop-up shows a sheet laid out like the
   D&D 2024 character sheet. Leave out anything you don't know and it shows a dash.
     sheet:{
       sp:"Human", cl:"Wizard", lvl:5,        // species, class, level (level sets the proficiency bonus)
       pb:3,                                   // optional: proficiency bonus if there's no class level
       size:"Medium", speed:"30 ft.", ac:15, hp:38,
       abil:{str:10, dex:14, con:12, int:16, wis:13, cha:8},
       saves:["int","wis"],                    // proficient saving throws
       skills:["Arcana","Perception"],         // proficient skills ("expert" for expertise)
       senses:"Darkvision 60 ft.", langs:["Elvish"],   // don't list Common
       attacks:[{n:"Dagger", hit:"+4", dmg:"1d4+2 piercing", note:"Finesse, light, thrown"}],   // a plain weapons table
       actions:[{t:"action", ic:"sword", n:"Dagger", hit:"+4", dmg:"1d4+2 piercing", range:"Melee", p:"What it does.", from:"Lesson name"}],
                                               // "In battle" cards. t: action | bonus | reaction
                                               // ic: sword | fire | hand | smite | shieldup
       traits:[{n:"Name", p:"What it does."}],
       spells:{ability:"Intelligence", dc:13, atk:"+5", list:[{lvl:"Cantrips", s:["Fire Bolt"]},{lvl:"1st", s:["Shield"]}]},
       lessons:[{from:"Aoife", n:"Smite", p:"What it does."}, {sealed:true}],   // sealed = not learned yet (no name, so it can't be peeked at)
       gear:["Spellbook"]
     }
     Modifiers, saves, skills, initiative and passive Perception are worked out from the scores.
   ===================================================================== */
const DATA = {
  lastSession: 18,
  level: 5,
  flavor: "After the theft of the black market, the company rests uneasily at the Blue Water Inn in Vallaki. The town smiles at them by day. By night, it whispers.",
  location: "Vallaki — the Blue Water Inn, after Session 18.",
  threads: [
    "Learn what became of Lady Wachter's missing maid. The Gold tier of her society is the promised reward.",
    "Victor Vallakovich has invited the party to his home.",
    "Ezmerelda and Arabelle are scouting the Reformation Center, where Vistani prisoners are being sent.",
    "St. Andral's bones are still missing.",
    "Find a way to bring back Stella's lost soul. Arabelle is trying to reach her through her visions of the dead.",
    "Lady Fiona Wachter's cult plots to take over Vallaki. Two cultists from the black market know the party's faces.",
    "Vinny's body is still inside Alir's bag of holding."
  ],

  sessions: [
    {n:"1–4", t:"Death House", s:"The party cleared the Death House and met Rahadin, who told them to head east to the Gates of Barovia. He then lifted the house into the air, crushed it into a ball, and left.", who:["rahadin"]},
    {n:"5", t:"Vistani Camp", s:"Runi led the party to Madam Eva, who said the only way out of Barovia is to kill Strahd. She gave a Tarokka reading and a personal fortune to each of them in exchange for delivering a package to her granddaughter. The party reached level 4, heard of a wizard Strahd threw from Ravenloft, saw the march of the dead, and entered the Village of Barovia.", who:["runi","eva"]},
    {n:"6", t:"Village of Barovia", s:"In the Blood of the Vine Tavern, Ismark told them Rahadin killed his father, the Burgomaster, and asked for help. Bandits ambushed the party, and an interrogation revealed two halflings had passed through a month earlier.", who:["ismark","rahadin"]},
    {n:"7", t:"The Burgomaster's Request", s:"Sabrina rewarded them with a silver dagger, and Mary asked them to find her daughter Gertruda. They met Ireena and Ismark at the manor, and Father Donavich sent them to the undercroft to retrieve a holy symbol. Doru asked for a test of his vampiric urges instead of death, and he passed.", who:["sabrina","mary","ireena","ismark","donavich","doru"]},
    {n:"8", t:"The Funeral", s:"Donavich began Kolyan's funeral, and then Rahadin and Strahd walked in. Strahd defeated the party and revealed he had used Modify Memory to show off. Back at the manor, they overheard Ireena and Ismark arguing.", who:["donavich","rahadin","strahd","ireena","ismark"]},
    {n:"9", t:"Leaving the Village", s:"The party agreed to escort Ireena to St. Andral's in Vallaki. At Argynvost Hill she gave the bracelet to Namroc and the flower and charm to Lala. On the Old Svalich Road they solved the ruined church puzzle and spared a vampire spawn who confessed to kidnapping Gertruda. They recovered Lala's family items and letter, then saved a raven at Tser Falls from a Greater Strix.", who:["ireena"]},
    {n:"10", t:"Entering Vallaki", s:"Escher ambushed them at the crossroads, mistook Aoife for Ireena, and lost an arm to her. The party got a warning about Vallaki from Morgantha at the windmill, then reached the town and passed the immigration test. Everyone but Namroc got a violence permit, and Alir was stamped as a noble.", who:["escher","morgantha"]},
    {n:"11", t:"Vallaki", s:"The party split up in Vallaki, and Namroc was bitten by a rabid attacker who was taken to the Reformation Center. At the Blue Water Inn they met Rictavio, Fiona Wachter, and Urwin. Fiona invited Alir to her book club, and Urwin hired Barlow to check on the winery.", who:["rictavio","fiona","urwin"]},
    {n:"12", t:"Vallaki", s:"Aoife beheaded Strahd during the night, and he was unbothered. Father Lucian asked the party to find St. Andral's missing bones, and the trail led to the orphanage. They found Ella sick and her mother dead. The mother's Dream Pastry addiction had led her to sell children.", who:["strahd","lucian","ella"]},
    {n:"13", t:"Vallaki", s:"At the orphanage, Scarlet swapped souls with Aoife, and Barlow killed the headmistress. The party found a crated Nosferatu in the attic, then took Scarlet to Blinsky. The Captain attacked there and wounded Aoife's arm, and a cloaked figure pulled him away.", who:["scarlet","belasco","blinsky","captain"]},
    {n:"14", t:"Vallaki", s:"The party learned Scarlet's origins and that souls recycle through Barovia. Aoife left the group to process the trauma. At Lake Zarovich they defeated a cult and an Aboleth and rescued Arabelle. Barlow took the staff Nimbus.", who:["scarlet","arabelle","bluto"]},
    {n:"15", t:"Outskirts of Vallaki", s:"Lancelot was revealed as a blink dog. The party met Jason Jr., who described the struggle for Alpha between Kiril and the Captain. At the cabin they found Ezmerelda, Kasimir, and the children, and killed Kiril. Barlow was bitten.", who:["lancelot","jason","ezmerelda","kasimir","kiril","captain"]},
    {n:"16", t:"Wizard of Wines", s:"Barlow received wolfsbane from Kasimir for his lycanthropy, and Kasimir left a raven familiar, Sir Loin. Lala got the Ring of Animal Influence and Namroc the Candleflame Longbow. At the winery the party beat the Shadow Druids, freed Darwin, and purified the wine.", who:["kasimir","sirloin","darwin"]},
    {n:"17", t:"Watcher House", s:"After a bar brawl, the party escaped Izek's guards and reached Wachterhaus. Fiona inducted them into the Silver tier of her society and asked Alir to learn what happened to her maid at the Baron's mansion. They found Stella's journal and Fiona's grimoire and put down the Wachter father.", who:["izek","fiona","stella","wachterfather","aaron","ireena"]},
    {n:"18", t:"The Secret", s:"The party robbed Vallaki's black market, a disguised [[abortion clinic]] run by [[Fiona's cult]]. Barlow knocked out [[Vinny the seller]], the party looted the backroom, and Alir stuffed Vinny into a [[bag of holding]], where he died, before they broke through a wall to the town hall. At the Blue Water Inn, Victor explained that he and Stella had tried to escape Barovia using their parents' notes. Alir found the experiments were flawed, and Victor copied the journal and paid an uncut diamond. Arabelle revealed she sees the dead and took Stella's notebook to try to reach her. Ezmerelda and Arabelle left to scout the Reformation Center.", who:["vinny","cultists","victor","arabelle","ezmerelda"]}
  ],

  // side: ally | unsure | foe ; fate: alive | dead | unknown
  npcs: [
    {id:"ireena", d:"The adopted daughter of the late burgomaster of the Village of Barovia, and the woman Strahd has his eye on. She travels with the party on and off, and Alir is teaching her magic.", name:"Ireena Kolyana", epi:"Daughter of the late burgomaster", side:"ally", fate:"alive", where:"Traveling with the party", met:"7", img:null,
     sheet:{sp:"Human", lvl:5, size:"Medium", speed:"30 ft.", ac:"15", hp:32,
       abil:{str:14, dex:12, con:12, int:12, wis:10, cha:15},
       saves:["wis","cha"], skills:["History","Insight","Persuasion"],
       actions:[
         {t:"action", ic:"sword", n:"Longsword", hit:"+5", dmg:"1d8+2 slashing", range:"Melee", p:"On a hit, Sap: the target has disadvantage on its next attack roll. Two hands: 1d10+2."},
         {t:"action", ic:"fire", n:"Fire Bolt", hit:"+4", dmg:"1d10 fire", range:"120 ft.", p:"A mote of fire. Sets unattended flammable objects alight.", from:"Alir's lesson · The Evoker's First Sparks"},
         {t:"action", ic:"hand", n:"Mage Hand", range:"30 ft.", p:"A spectral hand for 1 minute. It can lift 10 lb., open doors and fetch things, but can't attack.", from:"Alir's lesson · The Evoker's First Sparks"},
         {t:"bonus", ic:"smite", n:"Red Knight's Reckoning", dmg:"+2d8 radiant", range:"After a melee hit", uses:"1 / long rest", p:"Right after her sword hits, she pours the oath into the blow. 3d8 against Fiends and Undead.", from:"Aoife's lesson"}
       ],
       traits:[{n:"One blade", p:"Ireena never makes more than one attack on her turn. She fights best beside her friends, not ahead of them."}],
       lessons:[
         {from:"Aoife", n:"Red Knight's Reckoning", p:"Once per long rest, right after she hits with a melee weapon, she can use a bonus action to deal an extra 2d8 radiant damage (3d8 against Fiends and Undead)."},
         {from:"Alir", n:"The Evoker's First Sparks", p:"She knows the Fire Bolt and Mage Hand cantrips, and casts them with Intelligence (+4 to hit)."},
         {sealed:true}, {sealed:true}, {sealed:true}
       ],
       gear:["Breastplate","Longsword"]},
     facts:["Adopted daughter of Kolyan, the late burgomaster of the Village of Barovia, and sister to Ismark.","The party agreed to escort her to St. Andral's Church in Vallaki (Session 9). Strahd has shown open interest in her.","Gave her bracelet to Namroc and a flower and charm to Lala at Argynvost Hill.","Asked Alir to teach her magic after watching him fight. He has taught her Fire Bolt and Mage Hand, and Aoife has taught her to smite.","Comes and goes from the party. She left just before the winery and rejoined in Session 17."]},
    {id:"ismark", d:"Ireena's protective older brother. He asked the party to keep his sister safe after Rahadin killed their father.", name:"Ismark Kolyanovich", epi:"Ireena's brother", side:"ally", fate:"alive", where:"Burgomaster's manor, Village of Barovia", met:"6", img:null,
     facts:["Met the party in the Blood of the Vine Tavern and told them Rahadin killed his father, the Burgomaster.","Asked the party for help protecting his sister."]},
    {id:"arabelle", d:"The young Vistana Madam Eva named as the party's fated ally, and Luna reborn. She can see the dead, and is trying to reach Stella's lost soul.", name:"Arabelle", epi:"The fated ally", side:"ally", fate:"alive", where:"Scouting the Reformation Center with Ezmerelda", met:"14", img:null,
     sheet:{sp:"Human (Vistana)", cl:"Warlock", speed:"30 ft.",
       traits:[{n:"Sees the dead", p:"Arabelle can see the dead. She is using this to try to reach Stella's lost soul."}]},
     facts:["The Vistana girl named in Madam Eva's reading as the party's fated ally.","Rescued from a cult at Lake Zarovich (Session 14).","The party knows she is the reincarnation of Luna, Barlow's daughter.","Revealed in Session 18 that she sees the dead. She took Stella's journal to try to reach her.","Left the Blue Water Inn with Ezmerelda to scout the Reformation Center."]},
    {id:"ezmerelda", d:"Found by the party at the cabin outside Vallaki, along with Kasimir and the missing children. She is now scouting the Reformation Center with Arabelle.", name:"Ezmerelda d'Avenir", epi:"Found at the cabin", side:"ally", fate:"alive", where:"Scouting the Reformation Center with Arabelle", met:"15", img:null,
     sheet:{sp:"Human", size:"Medium", speed:"30 ft."},
     facts:["Found at the cabin outside Vallaki, along with Kasimir and the missing children (Session 15).","Left the Blue Water Inn with Arabelle to scout the Reformation Center (Session 18)."]},
    {id:"kasimir", d:"A dusk elf found at the cabin with Ezmerelda and the missing children. He gave Barlow wolfsbane for his curse and left the party a raven, Sir Loin.", name:"Kasimir Velikov", epi:"Dusk elf", side:"ally", fate:"alive", where:"Last seen after Session 16", met:"15", img:null,
     sheet:{sp:"Elf (dusk elf)", size:"Medium", speed:"30 ft.", senses:"Darkvision 60 ft."},
     facts:["Found at the cabin with Ezmerelda and the children (Session 15).","Gave Barlow a vial of wolfsbane for his lycanthropy and left the party a raven familiar, Sir Loin (Session 16)."]},
    {id:"eva", d:"The ancient Vistani seer who read the party's Tarokka. She told them the only way out of Barovia is to kill Strahd.", name:"Madam Eva", epi:"Seer of the Vistani", side:"ally", fate:"alive", where:"The Vistani camp", met:"5", img:null,
     facts:["Told the party the only way out of Barovia is to kill Strahd.","Read the Tarokka for the party and gave each of them a personal fortune, in exchange for delivering a package to her granddaughter."]},
    {id:"donavich", d:"The weary priest of the Village of Barovia's church. His son Doru is kept in the undercroft.", name:"Father Donavich", epi:"Priest of the village church", side:"ally", fate:"alive", where:"Church, Village of Barovia", met:"7", img:null,
     facts:["Sent the party into the church undercroft to retrieve a holy symbol.","Led Kolyan's funeral, which Strahd and Rahadin interrupted (Session 8).","Doru is his son."]},
    {id:"doru", d:"Father Donavich's son, turned into a vampire spawn. He begged to prove he could control his hunger, and passed the party's test.", name:"Doru", epi:"The son in the undercroft", side:"ally", fate:"alive", where:"Church undercroft, Village of Barovia", met:"7", img:null,
     facts:["A vampire spawn kept in the undercroft of the village church.","Asked the party to test his control over his vampiric urges instead of killing him, and he passed (Session 7)."]},
    {id:"lucian", d:"The priest of St. Andral's Church in Vallaki. He asked the party to recover the saint's stolen bones.", name:"Father Lucian Petrovich", epi:"Priest of St. Andral's", side:"ally", fate:"alive", where:"St. Andral's Church, Vallaki", met:"12", img:null,
     facts:["Asked the party to find the stolen bones of St. Andral (Session 12)."]},
    {id:"blinsky", d:"Vallaki's eccentric toymaker. He repaired Scarlet, and Aoife now wears a pair of his gloves.", name:"Gadof Blinsky", epi:"The toymaker of Vallaki", side:"ally", fate:"alive", where:"Blinsky's Toy Shop, Vallaki", met:"13", img:null,
     facts:["The party brought Scarlet to his shop for repairs (Session 13). The Captain attacked them there.","Aoife wears Blinsky's Gloves."]},
    {id:"urwin", d:"The friendly keeper of the Blue Water Inn. He sent Barlow to check on the winery, which led the party to the Shadow Druids.", name:"Urwin Martikov", epi:"Keeper of the Blue Water Inn", side:"ally", fate:"alive", where:"Blue Water Inn, Vallaki", met:"11", img:null,
     facts:["Met at the Blue Water Inn (Session 11).","Hired Barlow to check on the winery, which led to the fight with the Shadow Druids."]},
    {id:"lancelot", d:"The party's loyal hound, who turned out to be a blink dog.", name:"Lancelot", epi:"Loyal hound", side:"ally", fate:"alive", where:"With the party", met:"—", img:null,
     facts:["Revealed to be a blink dog in Session 15.","Travels with the party."]},
    {id:"sirloin", d:"A raven familiar Kasimir left with the party.", name:"Sir Loin", epi:"Raven familiar", side:"ally", fate:"alive", where:"With the party", met:"16", img:null,
     facts:["A raven familiar Kasimir left with the party (Session 16)."]},

    {id:"rictavio", d:"A flamboyant traveling showman staying at the Blue Water Inn. The party suspects he is not who he claims to be.", name:"Rictavio", epi:"A traveling showman", side:"unsure", fate:"alive", where:"Blue Water Inn, Vallaki", met:"11", img:null,
     facts:["Met at the Blue Water Inn (Session 11).","The party is trying to learn who he really is."]},
    {id:"victor", d:"The Baron's son, who once tried to escape Barovia with Stella using his parents' notes. He bought her journal from the party and invited them to his home.", name:"Victor Vallakovich", epi:"The Baron's son", side:"unsure", fate:"alive", where:"Vallaki — invited the party to his home", met:"18", img:null,
     facts:["Explained that he and Stella tried to escape Barovia using their parents' notes. Alir found the experiments were flawed.","Paid the party an uncut diamond for Stella's journal and made his own copy.","Invited the party to his home (Session 18)."]},
    {id:"fiona", d:"A wealthy noble who runs Vallaki's Society of Illuminated Thought. The party now knows the society is a cult plotting to take over the town.", name:"Lady Fiona Wachter", epi:"Head of the Society of Illuminated Thought", side:"unsure", fate:"alive", where:"Watcher House, Vallaki", met:"11", img:null,
     facts:["Invited Alir to her book club, the Society of Illuminated Thought (Session 11).","Inducted the party into the Silver tier and gave them the Silver Ouroboros Ring (Session 17).","Asked the party to learn what happened to her maid. The Gold tier is the promised reward.","The party knows she leads a cult plotting to take over Vallaki, and that the cult runs the town's black market."]},
    {id:"morgantha", d:"An old woman living at the windmill outside Vallaki. She warned the party about the town.", name:"Morgantha", epi:"The old woman at the windmill", side:"unsure", fate:"alive", where:"The windmill", met:"10", img:null,
     facts:["Gave the party a warning about Vallaki at the windmill (Session 10)."]},
    {id:"aaron", d:"Lady Wachter's son, last seen fleeing Watcher House and calling for help.", name:"Aaron Wachter", epi:"Fiona's son", side:"unsure", fate:"alive", where:"Vallaki — fled Watcher House calling for help", met:"17", img:null,
     facts:["Fled Watcher House calling for help during Session 17."]},
    {id:"runi", d:"The Vistana who led the party to Madam Eva's camp.", name:"Runi", epi:"Vistana guide", side:"unsure", fate:"alive", where:"The Vistani camp", met:"5", img:null,
     facts:["Led the party to Madam Eva (Session 5)."]},
    {id:"sabrina", d:"A villager of Barovia who rewarded the party with a silver dagger.", name:"Sabrina", epi:"Of the Village of Barovia", side:"unsure", fate:"alive", where:"Village of Barovia", met:"7", img:null,
     facts:["Rewarded the party with a silver dagger (Session 7)."]},
    {id:"mary", d:"A desperate mother in the Village of Barovia whose daughter, Gertruda, is missing.", name:"Mary", epi:"A desperate mother", side:"unsure", fate:"alive", where:"Village of Barovia", met:"7", img:null,
     facts:["Asked the party to find her missing daughter, Gertruda (Session 7)."]},
    {id:"ella", d:"A sick girl the party found while tracking St. Andral's bones. Her mother is dead.", name:"Ella", epi:"A sick child", side:"unsure", fate:"alive", where:"Vallaki", met:"12", img:null,
     facts:["Found sick while following the trail of St. Andral's bones. Her mother was dead (Session 12).","Her mother's Dream Pastry addiction had led her to sell children."]},
    {id:"scarlet", d:"A living doll who once swapped souls with Aoife. Now an ally, she lives inside Alir's bag of holding.", name:"Scarlet", epi:"The living doll", side:"ally", fate:"alive", where:"Alir's bag of holding", met:"13", img:null,
     sheet:{sp:"Living doll"},
     facts:["Swapped souls with Aoife at the orphanage (Session 13).","Brought to Blinsky's for repairs.","The party learned her origins in Session 14, and that souls recycle through Barovia.","Now an ally of the party. She lives in Alir's bag of holding."]},
    {id:"jason", d:"A source on Vallaki's werewolves. He told the party about the fight between Kiril and the Captain to become Alpha.", name:"Jason Jr.", epi:"Source on the werewolves", side:"unsure", fate:"alive", where:"Outskirts of Vallaki", met:"15", img:null,
     facts:["Told the party about the struggle for Alpha between Kiril and the Captain (Session 15)."]},
    {id:"darwin", d:"A prisoner the party freed at the winery after defeating the Shadow Druids.", name:"Darwin", epi:"Freed at the winery", side:"unsure", fate:"alive", where:"The winery", met:"16", img:null,
     facts:["Freed by the party at the winery after they beat the Shadow Druids (Session 16)."]},
    {id:"stella", d:"Victor's lover. Her body lies hollow at Watcher House, and her soul is lost somewhere in Barovia.", name:"Stella Wachter", epi:"The hollow girl", side:"unsure", fate:"unknown", where:"Watcher House (her body only)", met:"17", img:null,
     facts:["Victor's lover. Her body lies hollow at Watcher House, and her soul is lost.","The party found her journal (Session 17). Arabelle now has it, and Victor has a copy.","Finding a way to bring back her soul is an open quest."]},
    {id:"artyom", d:"A Vistana from Krezk met at the Vistani camp. He told the party about a powerful wizard who dueled Strahd and was thrown from the cliffs of Ravenloft.", name:"Artyom", epi:"", side:"unsure", fate:"alive", where:"—", met:"—", img:null, facts:[]},
    {id:"milivoj", name:"Milivoj", epi:"", side:"unsure", fate:"alive", where:"—", met:"—", img:null, facts:[]},

    {id:"strahd", d:"The vampire lord of Barovia, ancient, patient and cruel. Aoife once took his head, and it only bored him.", name:"Strahd von Zarovich", epi:"Lord of Barovia", side:"foe", fate:"alive", where:"Unknown", met:"8", img:null,
     facts:["Walked into Kolyan's funeral with Rahadin, defeated the party, then revealed it was all a Modify Memory illusion to show off his power (Session 8).","Aoife cut off his head at the Blue Water Inn while he caressed Ireena's hair. It did not kill him, and he seemed bored (Session 12).","Madam Eva says the only way out of Barovia is to kill him."]},
    {id:"rahadin", d:"Strahd's right hand. Ismark says he killed the burgomaster of Barovia, and the party watched him crush the Death House into a ball.", name:"Rahadin", epi:"Strahd's right hand", side:"foe", fate:"alive", where:"Unknown", met:"1–4", img:null,
     facts:["Met the party at the Death House and told them to head east to the Gates of Barovia, then crushed the house into a ball.","Ismark says Rahadin killed his father, the Burgomaster.","Walked into Kolyan's funeral at Strahd's side."]},
    {id:"captain", d:"Aoife's old enemy from her years at sea, now a werewolf fighting to lead the pack. He wounded Aoife at Blinsky's shop.", name:"The Captain", epi:"Aoife's old enemy", side:"foe", fate:"alive", where:"Vallaki", met:"13", img:null,
     facts:["Attacked the party at Blinsky's Toy Shop and wounded Aoife's arm. A cloaked figure pulled him away (Session 13).","Was locked in a struggle with Kiril to become Alpha of the werewolves."]},
    {id:"escher", d:"He ambushed the party at the crossroads, mistook Aoife for Ireena, and lost an arm to her.", name:"Escher", epi:"One-armed now", side:"foe", fate:"alive", where:"Vallaki", met:"10", img:null,
     facts:["Ambushed the party at the crossroads, mistook Aoife for Ireena, and lost an arm to her (Session 10)."]},
    {id:"izek", d:"The Baron of Vallaki's brutal enforcer. His guards hunt the party after the bar brawl.", name:"Izek Strazni", epi:"The Baron's enforcer", side:"foe", fate:"alive", where:"Vallaki", met:"17", img:null,
     facts:["The party escaped his guards after a bar brawl (Session 17).","Displayed Vistani prisoners on a stage with the Baron, bound for the Reformation Center."]},
    {id:"cultists", d:"Members of Fiona's cult who work Vallaki's black market. Two of them saw the party's faces during the robbery.", name:"Black Market Cultists", epi:"Two who know our faces", side:"foe", fate:"alive", where:"Vallaki's black market", met:"18", img:null,
     facts:["Members of Fiona's cult working the black market. They saw the party during the robbery (Session 18)."]},
    {id:"bluto", d:"A foe the party faced at Lake Zarovich during the fight with the cult. His fate is unknown.", name:"Bluto", epi:"", side:"foe", fate:"unknown", where:"Lake Zarovich", met:"14", img:null, facts:[]},

    {id:"kiril", d:"A Vallaki guard captain who was secretly a werewolf, and the Captain's rival for Alpha. The party killed him at the cabin, but not before he bit Barlow.", name:"Kiril", epi:"The guard captain who was a wolf", side:"foe", fate:"dead", where:"—", met:"15", img:null,
     facts:["A Vallakian guard captain and a werewolf, rival to the Captain for Alpha.","Killed by the party at the cabin, by decapitation (Session 15). He bit Barlow in the fight.","Barlow carries his head."]},
    {id:"belasco", d:"The cruel headmistress of Vallaki's orphanage. Barlow killed her.", name:"Headmistress Claudia Belasco", epi:"Of the orphanage", side:"foe", fate:"dead", where:"—", met:"13", img:null,
     facts:["Killed by Barlow at the orphanage (Session 13)."]},
    {id:"vinny", d:"A black market seller who died inside Alir's bag of holding after the robbery.", name:"Vinny", epi:"Black market seller", side:"foe", fate:"dead", where:"Inside Alir's bag of holding", met:"18", img:null,
     facts:["Barlow knocked him out during the black market robbery, and Alir stuffed him into his bag of holding, where he died (Session 18)."]},
    {id:"wachterfather", d:"Lady Wachter's husband, kept alive in a horrifying state inside Watcher House until the party put him to rest.", name:"The Wachter Father", epi:"Of Watcher House", side:"unsure", fate:"dead", where:"Watcher House", met:"17", img:null,
     facts:["Kept alive in a horrifying state inside Watcher House.","The party put him down out of respect (Session 17)."]}
  ],

  places: [
    {r:"The Mists", n:"Death House", p:"Where it began. The party cleared it, and Rahadin crushed it into a ball as he left.", s:"1–4", g:"house"},
    {r:"The Mists", n:"Gates of Barovia", p:"The gates Rahadin sent the party east toward.", s:"1–4", g:"gate"},
    {r:"The Valley", n:"The Vistani Camp", p:"Where Madam Eva read the Tarokka for the party.", s:"5", g:"star"},
    {r:"Village of Barovia", n:"Village of Barovia", p:"A grieving village under Strahd's shadow. Home of Ireena and Ismark.", s:"5", g:"house"},
    {r:"Village of Barovia", n:"Blood of the Vine Tavern", p:"Where Ismark first asked the party for help.", s:"6", g:"cup"},
    {r:"Village of Barovia", n:"Burgomaster's Manor", p:"Ireena and Ismark's home. The party overheard the siblings arguing here.", s:"7", g:"house"},
    {r:"Village of Barovia", n:"The Village Church", p:"Father Donavich's church. Doru waits in the undercroft below.", s:"7", g:"cross"},
    {r:"Village of Barovia", n:"Town Square", p:"The village's heart.", s:"7", g:"star"},
    {r:"Village of Barovia", n:"Argynvost Hill", p:"Where Ireena gave her bracelet to Namroc and her flower and charm to Lala.", s:"9", g:"moon"},
    {r:"The Road", n:"Old Svalich Road", p:"Home of the ruined church puzzle, and the vampire spawn who confessed to taking Gertruda.", s:"9", g:"road"},
    {r:"The Road", n:"Tser Falls", p:"Where the party saved a raven from a Greater Strix.", s:"9", g:"moon"},
    {r:"The Road", n:"The Windmill", p:"Where Morgantha warned the party about Vallaki.", s:"10", g:"mill"},
    {r:"Vallaki", n:"Vallaki", p:"A walled town of festivals and forced smiles. The party's base for now.", s:"10", g:"gate"},
    {r:"Vallaki", n:"Border Integrity & Immigration", p:"The party passed the immigration test. Everyone but Namroc got a violence permit, and Alir was stamped as a noble.", s:"10", g:"scroll"},
    {r:"Vallaki", n:"The Blue Water Inn", p:"The party's lodging, kept by Urwin. Rictavio, Victor, and Strahd himself have all turned up here.", s:"11", g:"cup"},
    {r:"Vallaki", n:"St. Andral's Church", p:"Father Lucian's church. The saint's bones are missing.", s:"12", g:"cross"},
    {r:"Vallaki", n:"The Orphanage", p:"Scarlet swapped souls with Aoife here, and Barlow killed the headmistress. A crated Nosferatu was found in the attic.", s:"12", g:"house"},
    {r:"Vallaki", n:"Blinsky's Toy Shop", p:"Scarlet is here for repairs. The Captain attacked the party here.", s:"13", g:"star"},
    {r:"Beyond Vallaki", n:"Lake Zarovich", p:"Where the party beat a cult and an Aboleth, rescued Arabelle, and recovered the staff Nimbus.", s:"14", g:"moon"},
    {r:"Beyond Vallaki", n:"The Winery", p:"Freed from the Shadow Druids. Darwin was freed and the wine purified.", s:"16", g:"cup"},
    {r:"Vallaki", n:"Watcher House", p:"Lady Wachter's home and the heart of her society. Stella's hollow body lies here.", s:"17", g:"house"},
    {r:"Vallaki", n:"The Black Market", p:"Disguised as an abortion clinic and run by Fiona's cult. Robbed by the party.", s:"18", g:"skull"},
    {r:"Vallaki", n:"Vallaki Town Hall", p:"Reached by breaking through a wall from the black market.", s:"18", g:"scroll"},
    {r:"Heard of", n:"Vallakovich Reformation Center", p:"Where the rabid attacker and the Vistani prisoners were taken. Ezmerelda and Arabelle are scouting it.", s:"—", g:"skull"}
  ],

  tarokka: [
    {n:"The Sunsword", st:"ongoing", p:"The sword is locked in a pile of treasure in darkness, beyond a set of amber doors."},
    {n:"The Holy Symbol of Ravenkind", st:"ongoing", p:"The symbol lies in a dragon's house, in hands once clean and now corrupted. Madam Eva warned that a powerful entity known as Baba Yaga also seeks it."},
    {n:"The Tome of Strahd", st:"ongoing", p:"The tome is with a man who is not what he seems, who arrives in a carnival wagon."},
    {n:"The Fated Ally", st:"done", p:"A Vistana girl, neglected by her father, in search of unlocking her true nature with the weave. Found: Arabelle, rescued at Lake Zarovich."},
    {n:"Strahd's Lair", st:"ongoing", p:"Strahd stands on a balcony, looking down upon this tortured land with somberness and sadness."}
  ],

  visions: [
    {who:"Alir", p:"An endless void. A massive gyroscope holding an hourglass; touching it reverses time and shows familiar yet unrecognizable children. A scythe-wielding hooded figure descends from what was the moon, wearing a pendant of a skull with a feather and scroll, and asks: “What is the worth of a single mortal life?” After his answer, a coin rests in Alir's hand: an hourglass in rotating rings, its sand flowing both ways."},
    {who:"Aoife", p:"Standing in mud and rain, her left arm gone. On a cliff above, a grotesque man-beast holds her severed arm in its jaws and a trident in its hand, mocking her."},
    {who:"Barlow", p:"A chaotic mob fight, his companions fighting desperately. Lala urges him to save someone. Then his daughter, Luna, with a noose around her neck, held captive by a laughing giant man on a boat."},
    {who:"Lala", p:"Kneeling amid amber crystals, holding a dying loved one, her sword shattered, as a grinning man approaches."},
    {who:"Namroc", p:"Pursued by a lycanthrope. Women offer to save him and end his village's famine if he helps restore them, which would lead to his own transformation."}
  ],

  quests: [
    {n:"Protect Ireena", t:"Side", st:"ongoing", p:"Keep Ireena safe from Strahd's attention."},
    {n:"Find Gertruda", t:"Side", st:"ongoing", p:"Mary's daughter is missing. A vampire spawn on the Old Svalich Road confessed to taking her."},
    {n:"St. Andral's Bones", t:"Vallaki", st:"ongoing", p:"Recover the stolen bones for Father Lucian. The trail led to the orphanage."},
    {n:"Lady Wachter's Missing Maid", t:"Vallaki", st:"ongoing", p:"Learn what happened to Fiona's maid at the Baron's mansion."},
    {n:"The Watcher Book Club", t:"Vallaki", st:"ongoing", p:"The party holds the Silver tier. Gold is offered if they solve the maid's disappearance."},
    {n:"Stella's Lost Soul", t:"Vallaki", st:"ongoing", p:"Find a way to bring Stella's soul back to her body."},
    {n:"Who Is Rictavio?", t:"Vallaki", st:"ongoing", p:"Uncover the showman's true identity."},
    {n:"Issues with the Vineyard", t:"Side", st:"done", p:"Checked on the winery for Urwin, beat the Shadow Druids, and purified the wine."},
    {n:"The Abandoned Orphanage", t:"Vallaki", st:"done", p:"Investigated the orphanage."},
    {n:"The Orphanage's Dark Secrets", t:"Vallaki", st:"done", p:"Uncovered what was happening to the children."},
    {n:"Saving Arabelle", t:"Vallaki", st:"done", p:"Rescued Arabelle from the cult at Lake Zarovich."},
    {n:"Victor's Lover's Journal", t:"Vallaki", st:"done", p:"Brought Stella's journal to Victor, who paid an uncut diamond."}
  ],

  party: [
    {n:"Alir", d:"An elf wizard of noble birth who studies the magic of evocation. He is searching for a way to bring back children who have died, and is teaching Ireena magic.", sp:"Elf", cl:"Evocation Wizard 5", ac:"12", acx:"15 with Mage Armor", pp:15, pi:15, hp:null, dc:null, langs:["Dwarvish","Elvish"], crest:"star",
     notes:["Seeks a way to bring back children who died.","Teaching Ireena magic.","Stamped as a noble at Vallaki's border.","Carries a bag of holding. Scarlet, the living doll, lives inside it (along with Vinny's body)."], fortune:"Alir"},
    {n:"Aoife Gharoth", d:"An orc paladin of the Red Knights, raised by pirates after they raided her hometown. The ship's cook taught her to love cooking, and she keeps strict cleaning rituals.", sp:"Orc", cl:"Oath of Vengeance Paladin 5", ac:"18", pp:14, pi:14, hp:44, dc:13, langs:["Elvish","Orc"], crest:"sword",
     notes:["Blindsight 10 ft, Darkvision 120 ft.","Blinsky's Gloves (Shadow Blade), Decanter of Endless Water, Battlechef Field Dresser.","Cut off Strahd's head in Session 12. Took Escher's arm in Session 10."], fortune:"Aoife"},
    {n:"Barlow", d:"A half-blind goliath monk who left the world behind after the people he healed betrayed him. He trusts animals more than people, and now carries a werewolf's bite.", sp:"Goliath", cl:"Warrior of the Elements Monk 5", ac:"15", pp:13, pi:13, hp:38, dc:14, langs:["Draconic","Giant"], crest:"storm",
     notes:["Storm Giant Large Form.","Attuned to Nimbus, Pillar of the Shattered Sky. Also carries a Moon-Touched Sword and Kiril's head.","Contracted lycanthropy from Kiril's bite (Session 15). Carries Kasimir's wolfsbane."], fortune:"Barlow"},
    {n:"Lala Littlebloom", d:"A halfling cleric of Lathander, god of the dawn, searching Barovia for her missing mother and father.", sp:"Halfling", cl:"Light Domain Cleric 5", ac:"18", pp:18, pi:13, hp:null, dc:null, langs:["Elvish","Halfling"], crest:"sun",
     notes:["Follows Lathander.","Searching for her parents. Recovered her family's items and letter on the Old Svalich Road.","Ring of Animal Influence. Ireena's flower and charm."], fortune:"Lala"},
    {n:"Namroc", d:"A young human ranger who left his famine-struck village to find a cure for its sickness. He hears out every side of an argument, and is famously awkward with people.", sp:"Human", cl:"Hunter Ranger 5", ac:"15", pp:10, pi:10, hp:44, dc:11, langs:["Dwarvish","Elvish","Halfling"], crest:"bow",
     notes:["Candleflame Longbow and an Elemental Gem.","Wears Ireena's bracelet.","Bitten by a rabid attacker in Vallaki (Session 11)."], fortune:"Namroc"}
  ],
  companions: [
    {n:"Ireena Kolyana", p:"Traveling with the party and learning magic from Alir.", id:"ireena"},
    {n:"Lancelot", p:"A blink dog, revealed in Session 15.", id:"lancelot"},
    {n:"Sir Loin", p:"Raven familiar, a gift from Kasimir.", id:"sirloin"}
  ]
};

/* =====================================================================
   MAP: pins and the party's travel trail (coordinates on a 2000x1364 map).
   Add a pin / extend a trail when the party reaches a new place.
   ===================================================================== */
const MAP_W=2000, MAP_H=1364;
const PINS=[
  {key:"Village of Barovia", x:1610, y:822, town:true, places:["Blood of the Vine Tavern","Burgomaster's Manor","The Village Church","Town Square","Argynvost Hill"]},
  {key:"Vallaki", x:842, y:462, town:true, places:["Border Integrity & Immigration","The Blue Water Inn","St. Andral's Church","The Orphanage","Blinsky's Toy Shop","Watcher House","The Black Market","Vallaki Town Hall","Vallakovich Reformation Center"]},
  {key:"Death House", x:1712, y:792, side:"t"},
  {key:"Gates of Barovia", x:1905, y:790, label:"Gates"},
  {key:"The Vistani Camp", x:1362, y:852, label:"Vistani Camp", side:"l"},
  {key:"Old Svalich Road", x:1430, y:912, label:"Ruined Church"},
  {key:"Tser Falls", x:1226, y:764, side:"t"},
  {key:"The Windmill", x:986, y:586},
  {key:"Lake Zarovich", x:960, y:360},
  {key:"The Winery", x:246, y:640}
];
const TRAIL_MAIN="M1905 790 C1820 788 1760 790 1712 792 S1640 815 1610 830 C1580 860 1550 905 1525 920 C1490 930 1450 915 1420 912 C1390 910 1355 912 1340 900 C1320 880 1312 845 1305 825 C1285 800 1250 775 1226 764 C1200 740 1170 680 1150 640 C1120 600 1040 585 986 586 C950 590 920 520 880 515 C830 510 780 505 745 500";
const TRAIL_SIDE="M745 500 C700 498 640 496 600 495 C540 494 470 488 430 485 C400 500 385 530 380 545 C360 580 320 610 300 620 C280 630 262 636 246 640";
const TRAIL_LAKE="M842 462 C870 430 920 400 960 360";
