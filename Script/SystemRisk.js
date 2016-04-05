
// This is variable for this program.
// Reading from user input.
var failureProb = [ 0.01, 0.04, 0.02, 0.01 ];
var exposures = [ 	[ 0.0, 6.0, 0.0, 10.0 ],
					[ 0.0, 0.0, 4.0, 8.0 ],
					[ 2.0, 0.0, 0.0, 0.0 ],
					[ 0.0, 0.0, 10.0, 0.0 ] ];
var thresholds = [ 11.0, 5.0, 7.0, 7.0 ];
var loss = [ 16.0, 20.0, 12.0, 8.0 ];
var bankCount= thresholds.length;
var failedInitiate = [0.0, 1.0, 0.0, 1.0];
// failedMore function for checking that are there any company that are a new failure.
function failedMore(failed, failedNow) {
	if(failed.length != failedNow.length) {
		throw('In failedMore function, the length of both are not the same.');
	}
	else {
		for(var i = 0; i < failed.length; ++i) {
			if(failed[i] < failedNow[i]){
				return true;			
			}
		}
		return false;
	}
}

// point-wise or function for union the result between two matrix.
function PWOr(failed, previousFailed) {
	if(failed.length != previousFailed.length) {
		throw('In PWOr function, the length of both are not the same.');
	}
	else {
		var seq = [];
		for(var i = 0; i < failed.length; ++i) {
			if(failed[i] > 0 || previousFailed[i] > 0){
				seq.push(1);
			}
			else {
				seq.push(0);
			}
		}
		return seq;
	}
}

// point-wise comparison function for comparison that the banks are bankrupted or not and return as a matrix.
function PWComparison(thresholds, loss) {
	if(thresholds.length != loss.length) {
		throw('In PWComparison function, the length of both are not the same.');
	}
	else {
		var seq = [];
		for(var i = 0; i < thresholds.length; ++i) {
			if(loss[i] > thresholds[i]){
				seq.push(1);
			}
			else {
				seq.push(0);
			}
		}
		return seq;
	}
}

// point-wise comparison function for comparison that the banks are bankrupted or not .
function failurePropagation(failedIndicator, exposures){
	if(failedIndicator.length != exposures[0].length) {
		throw('In failurePropagation, the length of both are not the same.');
	}
	else {
		var loss = [];
		// Calculating in each bank.
		for(var i = 0; i < exposures.length; ++i) {
			var count = 0.0;
			// Calculating how much money that each bank losses.
			for(var j = 0; j < exposures[i].length; ++j) {
				// If other banks fail, this bank losses some money.
				if(failedIndicator[j] == 1) {
					count += exposures[i][j];
				}
			}
			loss.push(count);
		}
		return loss;
	}
}


// total loss is used to calculate all money loss of the banks.
function totalLoss(loss) {
	var allLoss = 0.0;
	// Sum all of banks' loss.
	for(var i = 0; i < loss.length; ++i) {
		allLoss += loss[i];
	}
	return allLoss;
}

// probScenario function is calculated probability of each scenario.
function probScenario(failureProb, failed) {
	if(failureProb.length != failed.length) {
		throw('In failurePropagation, the length of both are not the same.');
	}
	else {
		var prob = 1.0;
		// Calculating in each bank.
		for(var i = 0; i < failureProb.length; ++i) {
			// if banks not failed.
			if(failed[i] < 1.0) {
				prob *= (1-failureProb[i]);
			}
			// if banks failed.
			else {
				prob *= (failureProb[i]);	
			}
		}
		// How likely of this scenario.
		return prob;
	}
}

// This function is the main function of all calculation.
function mainCalculation(failedNow) {
	do {
		// At the beginning, setting that failedIndicator is failedNow.
		var failedIndicator = failedNow;
		//console.log(failedIndicator);
		// Calculates what banks will fail.
		var loss = failurePropagation(failedIndicator, exposures);
		//console.log(loss);
		// Calculattes what companies will fail.
		var failed = PWComparison(thresholds, loss);
		//console.log(failed);
		// merging the new result and old result together.
		failedNow = PWOr(failed, failedIndicator);
		//console.log(failedNow);
	} while(failedMore(failedIndicator, failedNow));

	//console.log(failedNow);
}

// This do permutation.
function permutation(failed, index, workingFunction) {
	// Need to be more than 0, index of array can't be negative.
	if(index >= 0) {
		failed[i] = 0.0;
		permutation(failed, index - 1, workingFunction);
		failed[i] = 1.0;
		permutation(failed, index - 1, workingFunction);
	}
	else {
		// call mainCalculation.
		workingFunction(failed);
	}
}

// This function will do all possible scenario in the given data.
function generateAllPossible(bankCount) {
	var failed = [];
	//initiate that all banks is not failed.
	for(var i = 0; i < bankCount; ++i) {
		failed[i] = 0.0;
	}
	// Call permutation function.
	permutation(failed, bankCount - 1, mainCalculation);
}

/*
// A $( document ).ready() block.
$( document ).ready(function() {
	mainCalculation(failedInitiate);
});
*/