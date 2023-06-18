// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Room.sol";

contract RoomFactory {
    Room[] public RoomsList;

    event RoomDeployed(address indexed roomAddress, uint threshold);

    function DeployNewRoom(uint _threshold) public {
        Room room = new Room(_threshold);
        RoomsList.push(room);
        emit RoomDeployed(address(room), _threshold);
    }
    
    function roomGetter(uint _roomIndex) public view returns(address) {
        return address(RoomsList[_roomIndex]);
    }

}