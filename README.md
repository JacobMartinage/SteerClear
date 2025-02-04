# SafeWalk
Project for HackViolet 2025. 

# Inspiration
### The Seasons
Our inspiration project came from one of the issues with winter - it gets dark too early. Due to it being dark out later, it tends to be more dangerous later in the winter as it gets dark significantly earlier. Safety should always be a top priority, and since many college students are out and about at nights, it is important for them to take safe routes back. Both the lighting, and also having minimal criminal activity are important (alongside the distance/ time to walk it of course).

### The Reality
Getting home at night, particularly on you own at night is not a safe activity. This reality is especially true for women, especially the age group of 18-24 (Violence and Gender, 2023). Due to the potential physical danger it puts this specific group in, we wanted to create an application which is accessible to this age group and in the settings they would be getting home - hence we settled on a mobile app.

### The Motivation
Everyone as a human deserves to feel safe, and taking steps to address safety concerns are steps in the right direction to help treat and make everyone feel human. By now including those who traditionally are forced to develop behaviors like staying in groups or being extremely cautious allows them to have peace of mind even if they get separated from their group or if their precautions are not up to snuff. This technology allows them to let the app do the work of picking a route, and the display of where to avoid also helps guide decision making. Besides just focusing on the group of 18-24 year old women, this app can *assist anyone in any group that can feel unsafe to walk outside due to extenuating circumstances or their personal identity. *

### What it does
SteerClear is a user-data-driven mobile application akin to Waze; however, the data drives the safety analytics rather than traffic, in order to drive our route making algorithm to take you to the safest place possible. The users have the capability to report safe and unsafe situations in the app, and the ability to make groups to walk together.

# Full Features List:

- Interactive Map
- Community threat markers
- Community safety markers
- Smart route planning
- Panic button
- Heat map of all criminal/suspicious activity reported by community
- Reporting of safe areas
- Group Walk system
- College selection feature
- Alternate transportation recommendation system
- Turn by turn directions
- Recenter map feature
- Dynamic analyzation of threat/safety level (openai)
- Long press add waypoints to avoid
- How we built it

**Stack:**

- Frontend: Expo React Native
- Styling: NativeWind + CSS
- Database: Supabase Postgres (RLS)
- Auth: Supabase Auth
- Backend: Serverless (Supabase Edge Functions)
- APIs: MapBox, Google Places, OpenAI
- Map Build Out
- We used the MapBox and google places AI to build out our map and all the features connected to it.

## Supabase (Serverless) Backend and DB
Supabase edge functions served as our backend for this project, where we built out all of our functions, and then let supabae handle security and load balancing. This follows the FaaS (Functions as a Service) model, and allowed us to be very coherent and clear in our repository.

## User Interface
We built out a bottom sheet in order to have our map look like a traditional 'maps' style of application. This allowed for typical functionality of addresses, and really added to the look and feel. Since we stuck with this traditional 'maps' app aesthetic, we made all of the functionality accessible and packed into one page for our users.

## Challenges we ran into
There were a few major hiccups that we ran into. The biggest one on the frontend was getting the bottomSheet to look good, and also not interfere with the interactive map that it was lying on top of. The map itself caused a whole host of problems for our team, causing us to lose many crucial hours near the beginning, just trying to get the map to display and work properly. The step by step directions on said interactive map also took a toll on our collective sanity. This was one of the last things implemented, so the fear that we wouldn't finish was looming over our heads the entire time we were working on it, but we got it done and it looked great in our final product!

## Accomplishments that we're proud of
Got a ton of features done in a limited time frame, in a product we are overall really proud of. We were able to ship a ton of different small features into one cohesive app in very quick succession. Getting our routing algorithm working correctly was one of the major stepping stones since we thought that would be a major roadblock. Additionally, getting the general UI and look and feel going in the direction we intended was something we really were aiming for.

## What we learned
Serverless definitely made some things easier, but it was all of our first time's working with Deno, and we could not get local development of edge functions through docker working, so oftentimes we had to deploy and test over and over again. Definitely was useful for spinning things up quickly, but we would probably want to do some prep and learn more about containers before continuing.

## What's next for SteerClear
The future of SteerClear lies in expanding and strengthening features of our app. Many of the main draws of our app work great, but we know we can make them better. In addition to that, we want to expand our system to not only recommend when it is too dangerous to walk, but also give them price comparisons between all available options for travel (be it walking, uber, or saferide), creating the best user experience possible.

## Built With
- expo.io
- google-places
- javascript
- mapbox
- nativewind
- openai
- react-native
- supabase
- typescrip

# Demo Video
https://youtu.be/P3OlZBgFtGw
