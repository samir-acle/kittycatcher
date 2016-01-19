# KITTY CATCHER

This is a reevisioning of the classic pool game 'Marco Polo'. At the moment, there is not single player version, so encourage friends to play with you if noone else is currently playing. 

##Installation Instructions
Go to [https://kittycatcher.herokuapp.com/](https://kittycatcher.herokuapp.com/) to play.

##How to use
As the human: 
* Use the cursor keys to move around the screen
* Cats are only visible when they are close by
* Press the spacebar to reveal the cats location for a brief period of time
* Catch the cats to increase your point total
* Using the spacebar decreases your point total so use it wisely

As a cat:
* Use the cursor keys to move around
* Avoid the human!
* Cats have a combined point total which increases every two seconds if NO cat has been caught

The scores are currently global and persist over time. 

##Technologies used
###Libraries/Frameworks/Plug-Ins
* [socket.io](http://socket.io/)
* [phaser.io](http://phaser.io/)

##Next Steps
* Implement multiple game sessions
* Have the human be randomized every 20 seconds
* Implement chat functionality
* Decrease lag
