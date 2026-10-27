# Home Free — design

A first-person horror game in one browser file. Everything (geometry, textures, characters, audio) is generated in code at load.

## Premise
21 December 1994. Owen Hale, six, hid during a game of hide-and-seek in the family house on Coldharbour Lane. His brother J, nine, was It. J counted to twenty against the hall clock, looked for an hour, gave up and watched television. Police searched the woods behind the house for eleven days.

The next day Dad boarded and plastered over the old cupboard beside the stairs, a job already on his calendar. Nobody had told him it was the boys' den.

Now: 13 January 2020. Dad died in October. The house is demolished in the morning. J (the player) comes back at night, in snow, with the power out, to clear it.

## The thing upstairs
"It". Too tall, starved, chalk-grey with plaster dust. Its long hands are clamped over its face, as if it never finished counting.

- It hunts mostly by sound, so it can run at you blind.
- At close range it stops and spreads its fingers to peek. That is when light gives you away.
- Its face is seen twice: when it catches you, and at the very end.

It lives upstairs, which is out of reach because the stairs are rotten. It comes down the stairs and goes back up them, and it never teleports. Between hunts you hear it walking around overhead.

## Shape of the night (35–50 minutes)
Modelled on the slow-burn, everyday-chores structure of Fears to Fathom. Fear comes from ordinary tasks done in the wrong house. Every chore moves you through a room and either reveals story or plants something that pays off later. That is the defence against the series' common criticism of filler.

**Evening (about 20 min, no threat)**
1. Park in the snow, walk up the path, let yourself in. The power is out; the fuse box doesn't help.
2. The landline rings. Ruth, your sister: keep the photo albums, Dad's watch and Mum's ring box; everything else goes in the skip; the crew comes at seven.
3. Light the fire in the front room (matches in the kitchen drawer, logs in the basket). The fire is the only warm light in the house, and later it will be gone.
4. Pack. Each kept item is somewhere a memory is: the growth marks on our doorframe, Dad's calendar, the photo of the den. Carry the box out to the car. On one trip outside, something may be standing at an upstairs window. It will not be there when you look again.
5. Put the kettle on the gas ring. Sit down. You fall asleep.

**Night (about 20–30 min)**
6. 3:03. The fire is dead. The phone is ringing: three knocks on the line. The car keys are gone from the bowl where you left them. The box marked OWEN is open in the front room.
7. Footsteps overhead. Then counting. The hide-and-seek begins (Acts II and III below).

## Flow: one tension curve, not a checklist
Pacing follows the build-up → peak → relax cycle of Left 4 Dead's AI director. The monster is driven by two systems, following Alien: Isolation:
1. **The director** knows where the player is. It keeps a menace gauge and decides when It comes down, which area it is drawn toward, and when it must withdraw so the player can recover.
2. **It** knows only what it hears and sees. It searches the area of interest in a deliberately imperfect order, backtracks, listens at doors and checks hiding places. New behaviours unlock with story progress and with the player's habits, never with the player's deaths.

| Act | Player experience | System |
|---|---|---|
| I · Home | Walk the house. Pencil growth marks that stop at "O 6". Dad's calendar. The answering machine. No threat at all. | No presence for the first minutes; then footsteps overhead. A glimpse of it standing at the top of the stairs. |
| II · Someone else is counting | The first count, heard from upstairs. Hide. It comes down the stairs and searches. It leaves. Then three knocks from behind the plastered wall: Owen's knock. | First hunt has a short search budget. Hunt pressure builds with time and noise. It learns to check wardrobes the player keeps using. |
| III · Breaking in | Find Dad's hammer. Every blow on the plaster is loud enough to reach upstairs. Strike, hide, strike again. | No more counting. A loud strike brings it straight down. It checks under beds and listens at closed doors. |
| Release | The plaster gives. Owen's trainer, his torch, his walkie-talkie. "Found you." It stands in the hall, lowers its hands, turns, and climbs the stairs. Nothing counts again. | Scripted ending. |

## Player verbs (learned by surviving, never explained)
- Walk, run (loud), crouch (quiet).
- Doors: open and close. A closed door muffles sound and blocks its peeking.
- Hide in wardrobes and cupboards, or under beds.
- **Hold breath** (Space) while hidden. Breathing within a couple of metres of it is audible. Holding too long ends in a gasp.
- Creaking boards: a few floorboards are loud. You learn where they are.
- Torch: you need it to see, but it gives you away when it peeks.
- The walkie-talkie: optional, found in the boys' room. Its static rises as It gets close.

## Deliberately absent
No ghost children, no long-haired ghosts, no blood writing, no dolls or music boxes, no lightning, no creepy portraits, no notes that explain the rules, no item checklist, no teleporting monster, no "it was you all along".

## Research that shaped this
- Alien: Isolation's AI: [Game Developer](https://www.gamedeveloper.com/design/the-perfect-organism-the-ai-of-alien-isolation), [revisited](https://www.gamedeveloper.com/design/revisiting-the-ai-of-alien-isolation)
- Left 4 Dead director pacing: [Valve developer wiki](https://developer.valvesoftware.com/wiki/L4D2_Director_Scripts)
- Tension and release: [Game Developer](https://www.gamedeveloper.com/design/the-balancing-act-of-tension-in-horror-game-design); P.T.'s brevity: [CGM](https://www.cgmagonline.com/2021/07/13/p-t-brings-value-to-short-horror/)
- Frictional on anticipation and showing less: [Kotaku](https://kotaku.com/soma-is-scarier-when-the-monsters-aren-t-around-1734378666), [80.lv](https://80.lv/articles/frictional-games-on-its-history-developing-horror-games/)
