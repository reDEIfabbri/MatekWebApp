# Project Proposal Document

#### Project Title: Note taker webapp - [noticeable]

#### Author(s): Kovács Mihály - Q2776E

## 1. Executive Summary

> A brief overview of the project, summarizing the main points for quick understanding by stakeholders (non-technical
> persons).

I wish to create a unified and comprehensive note taking webapp, wich the user could use independently from the device's
type in the browser. I also could package it for desktop via electron, like Spotify.

The user would have access to basic text formatting tools, without the hassle of a full-blown office application. The
app would have basic intelligent features built in like pattern recognition and repetition. (For example: if it had
noticed that you are making a list, after you hit enter it would automaticly add the next bullet point, you wouldn't
need to lift your fingers from the keyboard.)

You could input insert images and paint freehand over your notes. So as the user you could circle and point arrows away
as you wished...

## 2. Introduction

### 2.1 Background

> Context and rationale for the project.

I used a wide range of note taking apps from the basic widgets that came with Windows 7, through the widely known Google
Keep and the less famous all freehand ("Write")[http://www.styluslabs.com/], to the more simplistic but also capable
MarkDown based word processors.

I still couldn't find one that I could use comfortably for more than one or two years...

### 2.2 Problem Statement

> The issue or opportunity the project aims to address.

Although I think sampled the market well enough, I still think there is room for more improvement, since even the more
platform agnostic ones tend to perform better on one certain device type.

## 3. Project Objectives

> Clear and specific goals the project intends to achieve.

I aim to create a tool that compiles the same features for all supported devices, while optimises for the different
use-case scenarios.
The saved notes should render the same on all devices if loaded in, no mater the original device used for creating it!

## 4. Scope

### 4.1 In-Scope

> What will be included in the project.

Creating a web-app, if it goes well package it for desktop.
In browser ui design for three device types:
1. desktop
2. tablet with stylus/touch input
3. mobile

Implementing input methods for keyboards (1. hardware; 2. virtual), and pointing devices (1. mouse; 2. touch; 3.
stylus/pressure sensitive).

Implementing drawing capabilities for the pointing devices. For 1. and 2. they should be toggled either by UI or
keystrokes.

Implementing basic formatting elements: like header 1, 2 and 3, italic, bold, paragraph, list (check, bullet and
alpha-numeric, with indentation), basic tables, text color, font size (compared to page size), link insertion, image
insertion.

Implementing basic page styles:
*** All pages will be the same size within a note, and repeat downwards ***

1. colour-scheme wise:
    - light
    - dark
    - reader friendly
2. layout wise: *[x/y]*
    - vertical *[210/297]*
    - horizontal *[297/210]*
3. margin wise:
    - no margin
    - thin margin
    - document margins

Implementing local storage, web-storage, and note management.

Implementing user authentication for non local usage. (You could choose whether you wish to sync a note to the cloud or
not. You wouldn't need to authenticate if you don't want to sync files between your devices.)

Implementing saving into files, that can be opened and edited later.

Implementing exporting to pdf and pictures for sharing, optionally to html with no external dependencies (it gets large
if you have a lot of pictures in your note).

### 4.2 Out-of-Scope

> What will not be included, to manage expectations.

Having different coloured texts apart from the basic and link font colours.

Styling of images.

Importing of notes that are alredy exported to PDF, HTML or picture formats.

Sharing directly from web-storage.

## 5. Methodology

### 5.1 Approach

> The strategy or methodology that would be used to achieve the project objectives.

### 5.2 Advised and Required (optional)

> List all methods, techniques and technologies with marking if they are advised or required in the solution.

### 5.3 Phases and Milestones (optional)

> High-level description of the project phases and key milestones.

### 5.4 Final exam topics (only for students, starting in 2025)

> List final exam topics which are mainly required for the project solution.

## 6. Benefits and Impact

> The anticipated benefits and impact of the project, both short-term and long-term.

## 7. Complexity

> Highlighting the engineering work and the complexity of the project.

## 8. Risk Management

> Identification of potential risks and strategies to mitigate them.

## 9. Resources Required

    • Personnel: The team members and their roles.
    • Equipment and Materials: Any special tools, software, or materials needed.
    • Budget: An initial estimate of the costs involved.