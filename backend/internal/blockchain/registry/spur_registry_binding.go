// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package registry

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// SpurRegistryMetaData contains all meta data concerning the SpurRegistry contract.
var SpurRegistryMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"address\",\"name\":\"initialOwner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"_platformWallet\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"_spurCoin\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"_projectFunding\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"OwnableInvalidOwner\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"OwnableUnauthorizedAccount\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"wallet\",\"type\":\"address\"}],\"name\":\"PlatformWalletUpdated\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"projectFunding\",\"type\":\"address\"}],\"name\":\"ProjectFundingUpdated\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"}],\"name\":\"SpurCoinUpdated\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"platformWallet\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"projectFunding\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"renounceOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_platformWallet\",\"type\":\"address\"}],\"name\":\"setPlatformWallet\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_projectFunding\",\"type\":\"address\"}],\"name\":\"setProjectFunding\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_spurCoin\",\"type\":\"address\"}],\"name\":\"setSpurCoin\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"spurCoin\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]",
}

// SpurRegistryABI is the input ABI used to generate the binding from.
// Deprecated: Use SpurRegistryMetaData.ABI instead.
var SpurRegistryABI = SpurRegistryMetaData.ABI

// SpurRegistry is an auto generated Go binding around an Ethereum contract.
type SpurRegistry struct {
	SpurRegistryCaller     // Read-only binding to the contract
	SpurRegistryTransactor // Write-only binding to the contract
	SpurRegistryFilterer   // Log filterer for contract events
}

// SpurRegistryCaller is an auto generated read-only Go binding around an Ethereum contract.
type SpurRegistryCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SpurRegistryTransactor is an auto generated write-only Go binding around an Ethereum contract.
type SpurRegistryTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SpurRegistryFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type SpurRegistryFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SpurRegistrySession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type SpurRegistrySession struct {
	Contract     *SpurRegistry     // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// SpurRegistryCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type SpurRegistryCallerSession struct {
	Contract *SpurRegistryCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts       // Call options to use throughout this session
}

// SpurRegistryTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type SpurRegistryTransactorSession struct {
	Contract     *SpurRegistryTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts       // Transaction auth options to use throughout this session
}

// SpurRegistryRaw is an auto generated low-level Go binding around an Ethereum contract.
type SpurRegistryRaw struct {
	Contract *SpurRegistry // Generic contract binding to access the raw methods on
}

// SpurRegistryCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type SpurRegistryCallerRaw struct {
	Contract *SpurRegistryCaller // Generic read-only contract binding to access the raw methods on
}

// SpurRegistryTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type SpurRegistryTransactorRaw struct {
	Contract *SpurRegistryTransactor // Generic write-only contract binding to access the raw methods on
}

// NewSpurRegistry creates a new instance of SpurRegistry, bound to a specific deployed contract.
func NewSpurRegistry(address common.Address, backend bind.ContractBackend) (*SpurRegistry, error) {
	contract, err := bindSpurRegistry(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &SpurRegistry{SpurRegistryCaller: SpurRegistryCaller{contract: contract}, SpurRegistryTransactor: SpurRegistryTransactor{contract: contract}, SpurRegistryFilterer: SpurRegistryFilterer{contract: contract}}, nil
}

// NewSpurRegistryCaller creates a new read-only instance of SpurRegistry, bound to a specific deployed contract.
func NewSpurRegistryCaller(address common.Address, caller bind.ContractCaller) (*SpurRegistryCaller, error) {
	contract, err := bindSpurRegistry(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &SpurRegistryCaller{contract: contract}, nil
}

// NewSpurRegistryTransactor creates a new write-only instance of SpurRegistry, bound to a specific deployed contract.
func NewSpurRegistryTransactor(address common.Address, transactor bind.ContractTransactor) (*SpurRegistryTransactor, error) {
	contract, err := bindSpurRegistry(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &SpurRegistryTransactor{contract: contract}, nil
}

// NewSpurRegistryFilterer creates a new log filterer instance of SpurRegistry, bound to a specific deployed contract.
func NewSpurRegistryFilterer(address common.Address, filterer bind.ContractFilterer) (*SpurRegistryFilterer, error) {
	contract, err := bindSpurRegistry(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &SpurRegistryFilterer{contract: contract}, nil
}

// bindSpurRegistry binds a generic wrapper to an already deployed contract.
func bindSpurRegistry(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := SpurRegistryMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_SpurRegistry *SpurRegistryRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _SpurRegistry.Contract.SpurRegistryCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_SpurRegistry *SpurRegistryRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _SpurRegistry.Contract.SpurRegistryTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_SpurRegistry *SpurRegistryRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _SpurRegistry.Contract.SpurRegistryTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_SpurRegistry *SpurRegistryCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _SpurRegistry.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_SpurRegistry *SpurRegistryTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _SpurRegistry.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_SpurRegistry *SpurRegistryTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _SpurRegistry.Contract.contract.Transact(opts, method, params...)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() view returns(address)
func (_SpurRegistry *SpurRegistryCaller) Owner(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _SpurRegistry.contract.Call(opts, &out, "owner")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() view returns(address)
func (_SpurRegistry *SpurRegistrySession) Owner() (common.Address, error) {
	return _SpurRegistry.Contract.Owner(&_SpurRegistry.CallOpts)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() view returns(address)
func (_SpurRegistry *SpurRegistryCallerSession) Owner() (common.Address, error) {
	return _SpurRegistry.Contract.Owner(&_SpurRegistry.CallOpts)
}

// PlatformWallet is a free data retrieval call binding the contract method 0xfa2af9da.
//
// Solidity: function platformWallet() view returns(address)
func (_SpurRegistry *SpurRegistryCaller) PlatformWallet(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _SpurRegistry.contract.Call(opts, &out, "platformWallet")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// PlatformWallet is a free data retrieval call binding the contract method 0xfa2af9da.
//
// Solidity: function platformWallet() view returns(address)
func (_SpurRegistry *SpurRegistrySession) PlatformWallet() (common.Address, error) {
	return _SpurRegistry.Contract.PlatformWallet(&_SpurRegistry.CallOpts)
}

// PlatformWallet is a free data retrieval call binding the contract method 0xfa2af9da.
//
// Solidity: function platformWallet() view returns(address)
func (_SpurRegistry *SpurRegistryCallerSession) PlatformWallet() (common.Address, error) {
	return _SpurRegistry.Contract.PlatformWallet(&_SpurRegistry.CallOpts)
}

// ProjectFunding is a free data retrieval call binding the contract method 0x169b3a80.
//
// Solidity: function projectFunding() view returns(address)
func (_SpurRegistry *SpurRegistryCaller) ProjectFunding(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _SpurRegistry.contract.Call(opts, &out, "projectFunding")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// ProjectFunding is a free data retrieval call binding the contract method 0x169b3a80.
//
// Solidity: function projectFunding() view returns(address)
func (_SpurRegistry *SpurRegistrySession) ProjectFunding() (common.Address, error) {
	return _SpurRegistry.Contract.ProjectFunding(&_SpurRegistry.CallOpts)
}

// ProjectFunding is a free data retrieval call binding the contract method 0x169b3a80.
//
// Solidity: function projectFunding() view returns(address)
func (_SpurRegistry *SpurRegistryCallerSession) ProjectFunding() (common.Address, error) {
	return _SpurRegistry.Contract.ProjectFunding(&_SpurRegistry.CallOpts)
}

// SpurCoin is a free data retrieval call binding the contract method 0x75eb6b9c.
//
// Solidity: function spurCoin() view returns(address)
func (_SpurRegistry *SpurRegistryCaller) SpurCoin(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _SpurRegistry.contract.Call(opts, &out, "spurCoin")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// SpurCoin is a free data retrieval call binding the contract method 0x75eb6b9c.
//
// Solidity: function spurCoin() view returns(address)
func (_SpurRegistry *SpurRegistrySession) SpurCoin() (common.Address, error) {
	return _SpurRegistry.Contract.SpurCoin(&_SpurRegistry.CallOpts)
}

// SpurCoin is a free data retrieval call binding the contract method 0x75eb6b9c.
//
// Solidity: function spurCoin() view returns(address)
func (_SpurRegistry *SpurRegistryCallerSession) SpurCoin() (common.Address, error) {
	return _SpurRegistry.Contract.SpurCoin(&_SpurRegistry.CallOpts)
}

// RenounceOwnership is a paid mutator transaction binding the contract method 0x715018a6.
//
// Solidity: function renounceOwnership() returns()
func (_SpurRegistry *SpurRegistryTransactor) RenounceOwnership(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _SpurRegistry.contract.Transact(opts, "renounceOwnership")
}

// RenounceOwnership is a paid mutator transaction binding the contract method 0x715018a6.
//
// Solidity: function renounceOwnership() returns()
func (_SpurRegistry *SpurRegistrySession) RenounceOwnership() (*types.Transaction, error) {
	return _SpurRegistry.Contract.RenounceOwnership(&_SpurRegistry.TransactOpts)
}

// RenounceOwnership is a paid mutator transaction binding the contract method 0x715018a6.
//
// Solidity: function renounceOwnership() returns()
func (_SpurRegistry *SpurRegistryTransactorSession) RenounceOwnership() (*types.Transaction, error) {
	return _SpurRegistry.Contract.RenounceOwnership(&_SpurRegistry.TransactOpts)
}

// SetPlatformWallet is a paid mutator transaction binding the contract method 0x8831e9cf.
//
// Solidity: function setPlatformWallet(address _platformWallet) returns()
func (_SpurRegistry *SpurRegistryTransactor) SetPlatformWallet(opts *bind.TransactOpts, _platformWallet common.Address) (*types.Transaction, error) {
	return _SpurRegistry.contract.Transact(opts, "setPlatformWallet", _platformWallet)
}

// SetPlatformWallet is a paid mutator transaction binding the contract method 0x8831e9cf.
//
// Solidity: function setPlatformWallet(address _platformWallet) returns()
func (_SpurRegistry *SpurRegistrySession) SetPlatformWallet(_platformWallet common.Address) (*types.Transaction, error) {
	return _SpurRegistry.Contract.SetPlatformWallet(&_SpurRegistry.TransactOpts, _platformWallet)
}

// SetPlatformWallet is a paid mutator transaction binding the contract method 0x8831e9cf.
//
// Solidity: function setPlatformWallet(address _platformWallet) returns()
func (_SpurRegistry *SpurRegistryTransactorSession) SetPlatformWallet(_platformWallet common.Address) (*types.Transaction, error) {
	return _SpurRegistry.Contract.SetPlatformWallet(&_SpurRegistry.TransactOpts, _platformWallet)
}

// SetProjectFunding is a paid mutator transaction binding the contract method 0xb15a8456.
//
// Solidity: function setProjectFunding(address _projectFunding) returns()
func (_SpurRegistry *SpurRegistryTransactor) SetProjectFunding(opts *bind.TransactOpts, _projectFunding common.Address) (*types.Transaction, error) {
	return _SpurRegistry.contract.Transact(opts, "setProjectFunding", _projectFunding)
}

// SetProjectFunding is a paid mutator transaction binding the contract method 0xb15a8456.
//
// Solidity: function setProjectFunding(address _projectFunding) returns()
func (_SpurRegistry *SpurRegistrySession) SetProjectFunding(_projectFunding common.Address) (*types.Transaction, error) {
	return _SpurRegistry.Contract.SetProjectFunding(&_SpurRegistry.TransactOpts, _projectFunding)
}

// SetProjectFunding is a paid mutator transaction binding the contract method 0xb15a8456.
//
// Solidity: function setProjectFunding(address _projectFunding) returns()
func (_SpurRegistry *SpurRegistryTransactorSession) SetProjectFunding(_projectFunding common.Address) (*types.Transaction, error) {
	return _SpurRegistry.Contract.SetProjectFunding(&_SpurRegistry.TransactOpts, _projectFunding)
}

// SetSpurCoin is a paid mutator transaction binding the contract method 0x19299310.
//
// Solidity: function setSpurCoin(address _spurCoin) returns()
func (_SpurRegistry *SpurRegistryTransactor) SetSpurCoin(opts *bind.TransactOpts, _spurCoin common.Address) (*types.Transaction, error) {
	return _SpurRegistry.contract.Transact(opts, "setSpurCoin", _spurCoin)
}

// SetSpurCoin is a paid mutator transaction binding the contract method 0x19299310.
//
// Solidity: function setSpurCoin(address _spurCoin) returns()
func (_SpurRegistry *SpurRegistrySession) SetSpurCoin(_spurCoin common.Address) (*types.Transaction, error) {
	return _SpurRegistry.Contract.SetSpurCoin(&_SpurRegistry.TransactOpts, _spurCoin)
}

// SetSpurCoin is a paid mutator transaction binding the contract method 0x19299310.
//
// Solidity: function setSpurCoin(address _spurCoin) returns()
func (_SpurRegistry *SpurRegistryTransactorSession) SetSpurCoin(_spurCoin common.Address) (*types.Transaction, error) {
	return _SpurRegistry.Contract.SetSpurCoin(&_SpurRegistry.TransactOpts, _spurCoin)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_SpurRegistry *SpurRegistryTransactor) TransferOwnership(opts *bind.TransactOpts, newOwner common.Address) (*types.Transaction, error) {
	return _SpurRegistry.contract.Transact(opts, "transferOwnership", newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_SpurRegistry *SpurRegistrySession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _SpurRegistry.Contract.TransferOwnership(&_SpurRegistry.TransactOpts, newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_SpurRegistry *SpurRegistryTransactorSession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _SpurRegistry.Contract.TransferOwnership(&_SpurRegistry.TransactOpts, newOwner)
}

// SpurRegistryOwnershipTransferredIterator is returned from FilterOwnershipTransferred and is used to iterate over the raw logs and unpacked data for OwnershipTransferred events raised by the SpurRegistry contract.
type SpurRegistryOwnershipTransferredIterator struct {
	Event *SpurRegistryOwnershipTransferred // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpurRegistryOwnershipTransferredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpurRegistryOwnershipTransferred)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpurRegistryOwnershipTransferred)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpurRegistryOwnershipTransferredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpurRegistryOwnershipTransferredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpurRegistryOwnershipTransferred represents a OwnershipTransferred event raised by the SpurRegistry contract.
type SpurRegistryOwnershipTransferred struct {
	PreviousOwner common.Address
	NewOwner      common.Address
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterOwnershipTransferred is a free log retrieval operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
func (_SpurRegistry *SpurRegistryFilterer) FilterOwnershipTransferred(opts *bind.FilterOpts, previousOwner []common.Address, newOwner []common.Address) (*SpurRegistryOwnershipTransferredIterator, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _SpurRegistry.contract.FilterLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return &SpurRegistryOwnershipTransferredIterator{contract: _SpurRegistry.contract, event: "OwnershipTransferred", logs: logs, sub: sub}, nil
}

// WatchOwnershipTransferred is a free log subscription operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
func (_SpurRegistry *SpurRegistryFilterer) WatchOwnershipTransferred(opts *bind.WatchOpts, sink chan<- *SpurRegistryOwnershipTransferred, previousOwner []common.Address, newOwner []common.Address) (event.Subscription, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _SpurRegistry.contract.WatchLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpurRegistryOwnershipTransferred)
				if err := _SpurRegistry.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseOwnershipTransferred is a log parse operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
func (_SpurRegistry *SpurRegistryFilterer) ParseOwnershipTransferred(log types.Log) (*SpurRegistryOwnershipTransferred, error) {
	event := new(SpurRegistryOwnershipTransferred)
	if err := _SpurRegistry.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// SpurRegistryPlatformWalletUpdatedIterator is returned from FilterPlatformWalletUpdated and is used to iterate over the raw logs and unpacked data for PlatformWalletUpdated events raised by the SpurRegistry contract.
type SpurRegistryPlatformWalletUpdatedIterator struct {
	Event *SpurRegistryPlatformWalletUpdated // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpurRegistryPlatformWalletUpdatedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpurRegistryPlatformWalletUpdated)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpurRegistryPlatformWalletUpdated)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpurRegistryPlatformWalletUpdatedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpurRegistryPlatformWalletUpdatedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpurRegistryPlatformWalletUpdated represents a PlatformWalletUpdated event raised by the SpurRegistry contract.
type SpurRegistryPlatformWalletUpdated struct {
	Wallet common.Address
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterPlatformWalletUpdated is a free log retrieval operation binding the contract event 0x73238e3ae0a71b401b31ae67204506d074de41bd5c084082fba9b64b1c7fa28f.
//
// Solidity: event PlatformWalletUpdated(address indexed wallet)
func (_SpurRegistry *SpurRegistryFilterer) FilterPlatformWalletUpdated(opts *bind.FilterOpts, wallet []common.Address) (*SpurRegistryPlatformWalletUpdatedIterator, error) {

	var walletRule []interface{}
	for _, walletItem := range wallet {
		walletRule = append(walletRule, walletItem)
	}

	logs, sub, err := _SpurRegistry.contract.FilterLogs(opts, "PlatformWalletUpdated", walletRule)
	if err != nil {
		return nil, err
	}
	return &SpurRegistryPlatformWalletUpdatedIterator{contract: _SpurRegistry.contract, event: "PlatformWalletUpdated", logs: logs, sub: sub}, nil
}

// WatchPlatformWalletUpdated is a free log subscription operation binding the contract event 0x73238e3ae0a71b401b31ae67204506d074de41bd5c084082fba9b64b1c7fa28f.
//
// Solidity: event PlatformWalletUpdated(address indexed wallet)
func (_SpurRegistry *SpurRegistryFilterer) WatchPlatformWalletUpdated(opts *bind.WatchOpts, sink chan<- *SpurRegistryPlatformWalletUpdated, wallet []common.Address) (event.Subscription, error) {

	var walletRule []interface{}
	for _, walletItem := range wallet {
		walletRule = append(walletRule, walletItem)
	}

	logs, sub, err := _SpurRegistry.contract.WatchLogs(opts, "PlatformWalletUpdated", walletRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpurRegistryPlatformWalletUpdated)
				if err := _SpurRegistry.contract.UnpackLog(event, "PlatformWalletUpdated", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParsePlatformWalletUpdated is a log parse operation binding the contract event 0x73238e3ae0a71b401b31ae67204506d074de41bd5c084082fba9b64b1c7fa28f.
//
// Solidity: event PlatformWalletUpdated(address indexed wallet)
func (_SpurRegistry *SpurRegistryFilterer) ParsePlatformWalletUpdated(log types.Log) (*SpurRegistryPlatformWalletUpdated, error) {
	event := new(SpurRegistryPlatformWalletUpdated)
	if err := _SpurRegistry.contract.UnpackLog(event, "PlatformWalletUpdated", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// SpurRegistryProjectFundingUpdatedIterator is returned from FilterProjectFundingUpdated and is used to iterate over the raw logs and unpacked data for ProjectFundingUpdated events raised by the SpurRegistry contract.
type SpurRegistryProjectFundingUpdatedIterator struct {
	Event *SpurRegistryProjectFundingUpdated // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpurRegistryProjectFundingUpdatedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpurRegistryProjectFundingUpdated)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpurRegistryProjectFundingUpdated)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpurRegistryProjectFundingUpdatedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpurRegistryProjectFundingUpdatedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpurRegistryProjectFundingUpdated represents a ProjectFundingUpdated event raised by the SpurRegistry contract.
type SpurRegistryProjectFundingUpdated struct {
	ProjectFunding common.Address
	Raw            types.Log // Blockchain specific contextual infos
}

// FilterProjectFundingUpdated is a free log retrieval operation binding the contract event 0x8c32437e4b0105e3dbfdeb6923a1354ffdab4de0b34f4b9a1be57c7632a173d5.
//
// Solidity: event ProjectFundingUpdated(address indexed projectFunding)
func (_SpurRegistry *SpurRegistryFilterer) FilterProjectFundingUpdated(opts *bind.FilterOpts, projectFunding []common.Address) (*SpurRegistryProjectFundingUpdatedIterator, error) {

	var projectFundingRule []interface{}
	for _, projectFundingItem := range projectFunding {
		projectFundingRule = append(projectFundingRule, projectFundingItem)
	}

	logs, sub, err := _SpurRegistry.contract.FilterLogs(opts, "ProjectFundingUpdated", projectFundingRule)
	if err != nil {
		return nil, err
	}
	return &SpurRegistryProjectFundingUpdatedIterator{contract: _SpurRegistry.contract, event: "ProjectFundingUpdated", logs: logs, sub: sub}, nil
}

// WatchProjectFundingUpdated is a free log subscription operation binding the contract event 0x8c32437e4b0105e3dbfdeb6923a1354ffdab4de0b34f4b9a1be57c7632a173d5.
//
// Solidity: event ProjectFundingUpdated(address indexed projectFunding)
func (_SpurRegistry *SpurRegistryFilterer) WatchProjectFundingUpdated(opts *bind.WatchOpts, sink chan<- *SpurRegistryProjectFundingUpdated, projectFunding []common.Address) (event.Subscription, error) {

	var projectFundingRule []interface{}
	for _, projectFundingItem := range projectFunding {
		projectFundingRule = append(projectFundingRule, projectFundingItem)
	}

	logs, sub, err := _SpurRegistry.contract.WatchLogs(opts, "ProjectFundingUpdated", projectFundingRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpurRegistryProjectFundingUpdated)
				if err := _SpurRegistry.contract.UnpackLog(event, "ProjectFundingUpdated", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseProjectFundingUpdated is a log parse operation binding the contract event 0x8c32437e4b0105e3dbfdeb6923a1354ffdab4de0b34f4b9a1be57c7632a173d5.
//
// Solidity: event ProjectFundingUpdated(address indexed projectFunding)
func (_SpurRegistry *SpurRegistryFilterer) ParseProjectFundingUpdated(log types.Log) (*SpurRegistryProjectFundingUpdated, error) {
	event := new(SpurRegistryProjectFundingUpdated)
	if err := _SpurRegistry.contract.UnpackLog(event, "ProjectFundingUpdated", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// SpurRegistrySpurCoinUpdatedIterator is returned from FilterSpurCoinUpdated and is used to iterate over the raw logs and unpacked data for SpurCoinUpdated events raised by the SpurRegistry contract.
type SpurRegistrySpurCoinUpdatedIterator struct {
	Event *SpurRegistrySpurCoinUpdated // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpurRegistrySpurCoinUpdatedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpurRegistrySpurCoinUpdated)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpurRegistrySpurCoinUpdated)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpurRegistrySpurCoinUpdatedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpurRegistrySpurCoinUpdatedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpurRegistrySpurCoinUpdated represents a SpurCoinUpdated event raised by the SpurRegistry contract.
type SpurRegistrySpurCoinUpdated struct {
	Token common.Address
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterSpurCoinUpdated is a free log retrieval operation binding the contract event 0xc5e31c1350b133812e5965af3ba83a2d9cc0e565b3f21996a5c99e74442da6ea.
//
// Solidity: event SpurCoinUpdated(address indexed token)
func (_SpurRegistry *SpurRegistryFilterer) FilterSpurCoinUpdated(opts *bind.FilterOpts, token []common.Address) (*SpurRegistrySpurCoinUpdatedIterator, error) {

	var tokenRule []interface{}
	for _, tokenItem := range token {
		tokenRule = append(tokenRule, tokenItem)
	}

	logs, sub, err := _SpurRegistry.contract.FilterLogs(opts, "SpurCoinUpdated", tokenRule)
	if err != nil {
		return nil, err
	}
	return &SpurRegistrySpurCoinUpdatedIterator{contract: _SpurRegistry.contract, event: "SpurCoinUpdated", logs: logs, sub: sub}, nil
}

// WatchSpurCoinUpdated is a free log subscription operation binding the contract event 0xc5e31c1350b133812e5965af3ba83a2d9cc0e565b3f21996a5c99e74442da6ea.
//
// Solidity: event SpurCoinUpdated(address indexed token)
func (_SpurRegistry *SpurRegistryFilterer) WatchSpurCoinUpdated(opts *bind.WatchOpts, sink chan<- *SpurRegistrySpurCoinUpdated, token []common.Address) (event.Subscription, error) {

	var tokenRule []interface{}
	for _, tokenItem := range token {
		tokenRule = append(tokenRule, tokenItem)
	}

	logs, sub, err := _SpurRegistry.contract.WatchLogs(opts, "SpurCoinUpdated", tokenRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpurRegistrySpurCoinUpdated)
				if err := _SpurRegistry.contract.UnpackLog(event, "SpurCoinUpdated", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseSpurCoinUpdated is a log parse operation binding the contract event 0xc5e31c1350b133812e5965af3ba83a2d9cc0e565b3f21996a5c99e74442da6ea.
//
// Solidity: event SpurCoinUpdated(address indexed token)
func (_SpurRegistry *SpurRegistryFilterer) ParseSpurCoinUpdated(log types.Log) (*SpurRegistrySpurCoinUpdated, error) {
	event := new(SpurRegistrySpurCoinUpdated)
	if err := _SpurRegistry.contract.UnpackLog(event, "SpurCoinUpdated", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
