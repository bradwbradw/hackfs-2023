// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Room.sol";

contract RoomFactory {
    Room[] public RoomsList;

    function DeployNewRoom(uint _threshold) public {
        Room room = new Room(_threshold);
        RoomsList.push(room);
    }
    
    function roomGetter(uint _roomIndex) public view returns(address) {
        return address(RoomsList[_roomIndex]);
    }

}