
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
var groupProb = [0.0, 0.0, 0.0, 0.0, 0.0];
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

// Show only ten graph.
var limit_graph = 10;
var countGraph;
// This function is the main function of all calculation.
function mainCalculation(failedNow) {
	
	var loss;

	do {
		// At the beginning, setting that failedIndicator is failedNow.
		var failedIndicator = failedNow;
		// Calculates what banks will fail.
		loss = failurePropagation(failedIndicator, exposures);
		// Calculattes what companies will fail.
		var failed = PWComparison(thresholds, loss);
		// merging the new result and old result together.
		failedNow = PWOr(failed, failedIndicator);
	} while(failedMore(failedIndicator, failedNow));

	if(limit_graph >= countGraph) {
		// adding a chert to html tag.
		generateChertH(failedNow, thresholds, loss, countGraph + 1, "Example a Scenario Result #");
		// count as a graph has been added.
		countGraph++;
	}
	

	var countloss = 0.0;
	for(var i = 0; i < failedNow.length; ++i) {
	  // if bank doesn't failed.
	  if(failedNow[i] < 1.0) {
	    countloss += loss[i];
	  } 
	  // bank did failed.
	  else {
	    countloss += (loss[i] >= thresholds[i]? loss[i]: thresholds[i]);
	  }
	}

	// return Totalloss.
	return countloss;
}

// This do permutation.
function permutation(failed, index, workingFunction) {
	// Need to be more than 0, index of array can't be negative.
	if(index >= 0) {
		failed[index] = 0.0;
		permutation(failed, index - 1, workingFunction);
		failed[index] = 1.0;
		permutation(failed, index - 1, workingFunction);
	}
	else {
		// call mainCalculation.
		var totalloss = workingFunction(failed);
		// get the probability of this scenario.
		var prob = probScenario(failureProb, failed);
		// convert to two digits number.
		prob = Math.round(prob*100)/100;
		// pushing all results in to the pair of array.
		mapProb.push([totalloss, prob]);
		// push it in group
		if(totalloss < 20.0) {
			groupProb[0] += prob;
		}
		else if(totalloss < 40.0) {
			groupProb[1] += prob;
		}
		else if(totalloss < 60.0) {
			groupProb[2] += prob;
		}
		else if(totalloss < 80.0) {
			groupProb[3] += prob;
		}
		else {
			groupProb[4] += prob;
		}
	}
}

// This function will do all possible scenario in the given data.
function generateAllPossible(bankCount) {
	var failed = [];
	
	// reset data;
	groupProb = [0.0, 0.0, 0.0, 0.0, 0.0];
	countGraph = 0;

	//initiate that all banks is not failed.
	for(var i = 0; i < bankCount; ++i) {
		failed[i] = 0.0;
	}
	// Call permutation function.
	permutation(failed, bankCount - 1, mainCalculation);
	// adding a chert to html tag for summarize part.
    addGraphH("tabSummarize", "Probabilities", "Visualizing Loss");
    // adding data to the cherts.
    reset("Probabilities");
    // adding a chert to html tag for summarize part.
    addGraphH("tabSummarize", "Groups", "Displaying Losses in");
    // adding data to the cherts.
    reset("Groups");
    // do cumulative value.
    cumulation(mapProb);
    // need to add to graph.
    addGraphH("tabSummarize", "Cumulation", "Displaying The ");
    // adding data to the cherts.
    reset("Cumulation");
    // do cumulative value.
}


function cumulation(mapProb) {
	// reset value;
	mapCumu = [];

	// sort depending on the loss.
	mapProb.sort(function (a,b) {
		if(a[0] > b[0])
		{
			return 1;
		}
		else if(a[0] < b[0])
		{
			return -1;
		}
		else {
			return 0;
		}
	});

	var sum = 0.0;
	
	// sum probrability	
	for(var i = 0; i < mapProb.length; ++i) {
		sum += mapProb[i][1];
		mapCumu.push([mapProb[i][0], sum]);
	}

}