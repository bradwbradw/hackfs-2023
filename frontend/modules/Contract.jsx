
import { watchContractEvent } from '@wagmi/core'
import { stringToHex } from 'viem'

import Room from '../../hardhat/artifacts/contracts/Room.sol/Room.json';
import RoomFactory from '../../hardhat/artifacts/contracts/RoomFactory.sol/RoomFactory.json';

import { Button } from '@nextui-org/react'

import MockGuardians from '../fixtures/guardians';

const ROOMFACTORY_CONTRACT = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
//console.log('room abi', Room?.abi);
const Contract = {
  optionsForCreationTx: ({
    guardians,
    threshold,
    address
  }) => {
    // for passing to wagmi usePrepareContractWrite
    // https://wagmi.sh/react/prepare-hooks/usePrepareContractWrite

    return {
      address: ROOMFACTORY_CONTRACT,
      abi: RoomFactory.abi,
      functionName: 'DeployNewRoom',
      args: [
        threshold
      ]
    }
  },
  listenForRoomCreatedEvent: (callback) => {
    console.log('waiting for event....');
    watchContractEvent(
      {
        address: ROOMFACTORY_CONTRACT,
        abi: RoomFactory.abi,
        eventName: 'RoomDeployed',
        //chainId: 314159 //FileCoin Calibration Testnet
        chainId: 31337
      },
      (eventData) => {
        console.log('eventData', eventData);

        var address = "??";
        // now, pick out the address of the new contract, and call the callback
        // with that address
        address = eventData.args[0];
        callback(address);
      });
  },
  optionsForRequestRecoveryTx: (params => {
    return {
    };
  }),
  getGuardians: (param) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(MockGuardians), 1500);
    });
  },
  encodeSecret: (secret) => {
    return new Promise((resolve, reject) => {

    });
  },
};

var ensRegistryABI = [{ "inputs": [{ "internalType": "contract ENS", "name": "_old", "type": "address" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "node", "type": "bytes32" }, { "indexed": true, "internalType": "bytes32", "name": "label", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "owner", "type": "address" }], "name": "NewOwner", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "node", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "resolver", "type": "address" }], "name": "NewResolver", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "node", "type": "bytes32" }, { "indexed": false, "internalType": "uint64", "name": "ttl", "type": "uint64" }], "name": "NewTTL", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "node", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "owner", "type": "address" }], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }], "name": "isApprovedForAll", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "old", "outputs": [{ "internalType": "contract ENS", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "bytes32", "name": "node", "type": "bytes32" }], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "bytes32", "name": "node", "type": "bytes32" }], "name": "recordExists", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "bytes32", "name": "node", "type": "bytes32" }], "name": "resolver", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "bytes32", "name": "node", "type": "bytes32" }, { "internalType": "address", "name": "owner", "type": "address" }], "name": "setOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "bytes32", "name": "node", "type": "bytes32" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "resolver", "type": "address" }, { "internalType": "uint64", "name": "ttl", "type": "uint64" }], "name": "setRecord", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "bytes32", "name": "node", "type": "bytes32" }, { "internalType": "address", "name": "resolver", "type": "address" }], "name": "setResolver", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "bytes32", "name": "node", "type": "bytes32" }, { "internalType": "bytes32", "name": "label", "type": "bytes32" }, { "internalType": "address", "name": "owner", "type": "address" }], "name": "setSubnodeOwner", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "bytes32", "name": "node", "type": "bytes32" }, { "internalType": "bytes32", "name": "label", "type": "bytes32" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "resolver", "type": "address" }, { "internalType": "uint64", "name": "ttl", "type": "uint64" }], "name": "setSubnodeRecord", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "bytes32", "name": "node", "type": "bytes32" }, { "internalType": "uint64", "name": "ttl", "type": "uint64" }], "name": "setTTL", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "bytes32", "name": "node", "type": "bytes32" }], "name": "ttl", "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }], "payable": false, "stateMutability": "view", "type": "function" }];
var wagmigotchiABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "caretaker", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "CaretakerLoved", "type": "event" }, { "inputs": [], "name": "clean", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "feed", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getAlive", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getBoredom", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getHunger", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getSleepiness", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getStatus", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getUncleanliness", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "love", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "play", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "sleep", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
export default Contract;