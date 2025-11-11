document.addEventListener('DOMContentLoaded', () => {
    
    // ===== STATE =====
    let players = [];
    let teams = [];
    let tournament = {};
    const STORAGE_KEY = 'badmintonPlayerGroups';

    // ===== DOM ELEMENTS =====
    const screens = document.querySelectorAll('.screen');
    const playerNameInput = document.getElementById('player-name-input');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const playerList = document.getElementById('player-list');
    const playerError = document.getElementById('player-error');
    const toTeamsBtn = document.getElementById('to-teams-btn');

    // NEW Group Management Elements
    const loadGroupSelect = document.getElementById('load-group-select');
    const loadGroupBtn = document.getElementById('load-group-btn');
    const deleteGroupBtn = document.getElementById('delete-group-btn');
    const saveGroupNameInput = document.getElementById('save-group-name-input');
    const saveGroupBtn = document.getElementById('save-group-btn');
    const groupMessage = document.getElementById('group-message');
    
    const teamList = document.getElementById('team-list');
    const teamError = document.getElementById('team-error');
    const backToPlayersBtn = document.getElementById('back-to-players-btn');
    const shuffleTeamsBtn = document.getElementById('shuffle-teams-btn');
    const startTournamentBtn = document.getElementById('start-tournament-btn');

    const tournamentContainer = document.getElementById('tournament-container');
    const winnerDisplay = document.getElementById('winner-display');
    const resetTournamentBtn = document.getElementById('reset-tournament-btn');
    const tournamentInfo = document.createElement('p'); // For bracket info

    // ===== NAVIGATION =====
    const showScreen = (screenId) => {
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    };

    toTeamsBtn.addEventListener('click', () => {
        if (players.length % 2 !== 0) {
            playerError.textContent = 'You must have an even number of players.';
            return;
        }
        if (players.length < 4) { // Min 4 players (2 teams)
            playerError.textContent = `You need at least 4 players (for 2 teams). You have ${players.length}.`;
            return;
        }
        if (players.length > 16) { // Max 16 players (8 teams)
            playerError.textContent = `You can have a maximum of 16 players (for 8 teams). You have ${players.length}.`;
            return;
        }
        playerError.textContent = '';
        generateTeams();
        showScreen('screen-team-setup');
    });

    backToPlayersBtn.addEventListener('click', () => showScreen('screen-player-setup'));
    
    startTournamentBtn.addEventListener('click', () => {
        if (teams.length < 2) {
            teamError.textContent = `You need at least 2 teams to start.`;
            return;
        }
        teamError.textContent = '';
        createBracket();
        renderTournament();
        showScreen('screen-tournament');
    });

    resetTournamentBtn.addEventListener('click', () => {
        // Reset state
        players = [];
        teams = [];
        tournament = {};
        
        // Clear UI
        playerList.innerHTML = '';
        teamList.innerHTML = '';
        tournamentContainer.innerHTML = '';
        winnerDisplay.style.display = 'none';
        winnerDisplay.innerHTML = '';
        playerNameInput.value = '';
        if (tournamentInfo.parentNode) {
            tournamentInfo.parentNode.removeChild(tournamentInfo);
        }

        // Go to first screen
        showScreen('screen-player-setup');
    });

    // ===== GROUP MANAGEMENT (LocalStorage) =====

    const getSavedGroups = () => {
        const groupsJson = localStorage.getItem(STORAGE_KEY);
        return groupsJson ? JSON.parse(groupsJson) : {};
    };

    const saveGroups = (groups) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    };

    const showGroupMessage = (message, isError = false) => {
        groupMessage.textContent = message;
        groupMessage.className = isError ? 'error' : 'success';
        
        setTimeout(() => {
            groupMessage.textContent = '';
            groupMessage.className = '';
        }, 3000);
    };

    const updateGroupDropdown = () => {
        const groups = getSavedGroups();
        loadGroupSelect.innerHTML = '<option value="">-- Select a group --</option>'; // Reset
        
        const groupNames = Object.keys(groups);
        if (groupNames.length === 0) {
            loadGroupSelect.innerHTML += '<option value="" disabled>No saved groups</option>';
        } else {
            groupNames.sort().forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                loadGroupSelect.appendChild(option);
            });
        }
    };

    saveGroupBtn.addEventListener('click', () => {
        const groupName = saveGroupNameInput.value.trim();
        if (groupName === '') {
            showGroupMessage('Please enter a group name.', true);
            return;
        }
        if (players.length === 0) {
            showGroupMessage('Add players to the list before saving.', true);
            return;
        }

        const groups = getSavedGroups();
        groups[groupName] = [...players]; // Save a copy
        saveGroups(groups);

        updateGroupDropdown();
        saveGroupNameInput.value = '';
        showGroupMessage(`Group '${groupName}' saved successfully!`, false);
    });

    loadGroupBtn.addEventListener('click', () => {
        const groupName = loadGroupSelect.value;
        if (groupName === '') {
            showGroupMessage('Please select a group to load.', true);
            return;
        }

        const groups = getSavedGroups();
        players = [...groups[groupName]]; // Load the group
        renderPlayerList(); // Update the UI
        showGroupMessage(`Group '${groupName}' loaded.`, false);
    });

    deleteGroupBtn.addEventListener('click', () => {
        const groupName = loadGroupSelect.value;
        if (groupName === '') {
            showGroupMessage('Please select a group to delete.', true);
            return;
        }

        if (confirm(`Are you sure you want to delete the group '${groupName}'? This cannot be undone.`)) {
            const groups = getSavedGroups();
            delete groups[groupName];
            saveGroups(groups);
            updateGroupDropdown();
            showGroupMessage(`Group '${groupName}' deleted.`, false);
        }
    });

    // ===== PLAYER MANAGEMENT =====
    addPlayerBtn.addEventListener('click', () => {
        const name = playerNameInput.value.trim();
        if (name === '') {
            playerError.textContent = 'Player name cannot be empty.';
            return;
        }
        if (players.includes(name)) {
            playerError.textContent = 'Player name must be unique.';
            return;
        }
        if (players.length >= 16) {
             playerError.textContent = 'Maximum of 16 players allowed.';
            return;
        }
        players.push(name);
        renderPlayerList();
        playerNameInput.value = '';
        playerError.textContent = '';
    });

    const renderPlayerList = () => {
        playerList.innerHTML = '';
        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.className = 'remove-player';
            removeBtn.onclick = () => {
                players = players.filter(p => p !== player);
                renderPlayerList();
            };
            li.appendChild(removeBtn);
            playerList.appendChild(li);
        });
        
        // Clear error if list becomes valid
        if (players.length > 0 && players.length % 2 === 0) {
            playerError.textContent = '';
        }
    };

    // ===== TEAM MANAGEMENT =====
    const generateTeams = () => {
        // Shuffle players (Fisher-Yates)
        let shuffledPlayers = [...players];
        for (let i = shuffledPlayers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
        }

        // Pair players
        teams = [];
        for (let i = 0; i < shuffledPlayers.length; i += 2) {
            teams.push({
                id: `T${(i/2) + 1}`,
                name: `Team ${(i/2) + 1}`,
                players: [shuffledPlayers[i], shuffledPlayers[i+1]]
            });
        }
        renderTeamList();
    };
    
    shuffleTeamsBtn.addEventListener('click', generateTeams);

    const renderTeamList = () => {
        teamList.innerHTML = '';
        teams.forEach(team => {
            const card = document.createElement('div');
            card.className = 'team-card';
            card.innerHTML = `
                <h3>${team.name} (${team.id})</h3>
                <p>${team.players.join(' & ')}</p>
            `;
            teamList.appendChild(card);
        });
    };

    // ===== TOURNAMENT LOGIC =====
    
    // Helper to get team object by ID
    const getTeamById = (id) => teams.find(t => t.id === id);

    // Creates the initial tournament structure
    const createBracket = () => {
        const numTeams = teams.length;
        let shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
        tournament = {}; // Reset

        if (numTeams === 4) {
            // --- 4-TEAM PAGE PLAYOFF ---
            tournament = {
                type: 4, // Page Playoff type
                bracketInfo: 'Page Playoff (IPL-Style) bracket for 4 teams.',
                q1: { id: 'q1', title: 'Qualifier 1', teams: [shuffledTeams[0].id, shuffledTeams[1].id], winner: null, loser: null, nextWinner: 'f', nextLoser: 'q2' },
                e:  { id: 'e',  title: 'Eliminator',  teams: [shuffledTeams[2].id, shuffledTeams[3].id], winner: null, loser: null, nextWinner: 'q2', nextLoser: null },
                q2: { id: 'q2', title: 'Qualifier 2', teams: [null, null], winner: null, loser: null, nextWinner: 'f', nextLoser: null },
                f:  { id: 'f',  title: 'Final',       teams: [null, null], winner: null, loser: null, nextWinner: null, nextLoser: null }
            };
        } else if (numTeams === 8) {
            // --- 8-TEAM PAGE PLAYOFF (with QF) ---
            tournament = {
                type: 8, // Page Playoff type
                bracketInfo: 'Page Playoff (IPL-Style) bracket. Winners of QF 1/2 go to Qualifier 1. Winners of QF 3/4 go to Eliminator.',
                qf1: { id: 'qf1', title: 'Quarter-Final 1', teams: [shuffledTeams[0].id, shuffledTeams[1].id], winner: null, loser: null, nextWinner: 'q1' },
                qf2: { id: 'qf2', title: 'Quarter-Final 2', teams: [shuffledTeams[2].id, shuffledTeams[3].id], winner: null, loser: null, nextWinner: 'q1' },
                qf3: { id: 'qf3', title: 'Quarter-Final 3', teams: [shuffledTeams[4].id, shuffledTeams[5].id], winner: null, loser: null, nextWinner: 'e' },
                qf4: { id: 'qf4', title: 'Quarter-Final 4', teams: [shuffledTeams[6].id, shuffledTeams[7].id], winner: null, loser: null, nextWinner: 'e' },
                q1: { id: 'q1', title: 'Qualifier 1', teams: [null, null], winner: null, loser: null, nextWinner: 'f', nextLoser: 'q2' },
                e:  { id: 'e',  title: 'Eliminator',  teams: [null, null], winner: null, loser: null, nextWinner: 'q2', nextLoser: null },
                q2: { id: 'q2', title: 'Qualifier 2', teams: [null, null], winner: null, loser: null, nextWinner: 'f', nextLoser: null },
                f:  { id: 'f',  title: 'Final',       teams: [null, null], winner: null, loser: null, nextWinner: null, nextLoser: null }
            };
        } else {
            // --- SINGLE ELIMINATION (for 2, 3, 5, 6, 7 teams) ---
            tournament = {
                type: 'SingleElimination',
                bracketInfo: `A standard Single Elimination bracket has been created for ${numTeams} teams. The Page Playoff system is only available for 4 or 8 teams.`,
                rounds: [],
                matchesLookup: {}
            };
            buildSingleElimination(shuffledTeams);
        }
    };

    // Main render function for the bracket
    const renderTournament = () => {
        tournamentContainer.innerHTML = ''; // Clear existing bracket
        winnerDisplay.style.display = 'none'; // Hide winner

        // Add the bracket info text
        tournamentInfo.textContent = tournament.bracketInfo;
        document.getElementById('screen-tournament').insertBefore(tournamentInfo, tournamentContainer);

        if (tournament.type === 4 || tournament.type === 8) {
            renderPagePlayoff();
        } else if (tournament.type === 'SingleElimination') {
            renderSingleElimination();
        }

        // Check for a final winner to display
        let finalWinnerId = null;
        if (tournament.type === 4 || tournament.type === 8) {
            finalWinnerId = tournament.f.winner;
        } else {
            const finalRound = tournament.rounds[tournament.rounds.length - 1];
            const finalMatch = tournament.matchesLookup[finalRound.matchIds[0]];
            finalWinnerId = finalMatch.winner;
        }

        if (finalWinnerId) {
            const winner = getTeamById(finalWinnerId);
            winnerDisplay.innerHTML = `<h2>🏆 CHAMPION 🏆<br>${winner.name} (${winner.players.join(' & ')})</h2>`;
            winnerDisplay.style.display = 'block';
        }
    };
    
    // --- START: Page Playoff Specific Functions ---
    const renderPagePlayoff = () => {
        if (tournament.type === 8) {
            // Render QF Column
            const qfCol = createBracketColumn('Quarter-Finals');
            qfCol.appendChild(createMatchEl(tournament.qf1));
            qfCol.appendChild(createMatchEl(tournament.qf2));
            qfCol.appendChild(createMatchEl(tournament.qf3));
            qfCol.appendChild(createMatchEl(tournament.qf4));
            tournamentContainer.appendChild(qfCol);
        }
        // Render Playoff Columns (shared by 4 and 8)
        const playoffCol1 = createBracketColumn('Playoffs 1');
        playoffCol1.appendChild(createMatchEl(tournament.q1));
        playoffCol1.appendChild(createMatchEl(tournament.e));
        tournamentContainer.appendChild(playoffCol1);
        
        const playoffCol2 = createBracketColumn('Playoffs 2');
        playoffCol2.appendChild(createMatchEl(tournament.q2));
        tournamentContainer.appendChild(playoffCol2);
        
        const finalCol = createBracketColumn('Final');
        finalCol.appendChild(createMatchEl(tournament.f));
        tournamentContainer.appendChild(finalCol);
    };
    
    // Click handler for selecting a winner
    const handleWinnerSelection = (e) => {
        const winningTeamId = e.target.dataset.teamId;
        const matchId = e.target.dataset.matchId;

        if (tournament.type === 4 || tournament.type === 8) {
            const match = tournament[matchId];
            if (!match || match.winner) return; // Don't process if match is done
            match.winner = winningTeamId;
            match.loser = match.teams.find(id => id !== winningTeamId);
            updatePagePlayoffState(); // Update the tournament structure
        } else {
            const match = tournament.matchesLookup[matchId];
            if (!match || match.winner) return;
            match.winner = winningTeamId;
            match.loser = match.teams.find(id => id !== winningTeamId);
            updateSingleEliminationState(match);
        }
        
        // Re-render the entire bracket
        renderTournament();
    };

    // **THE CORE LOGIC (Page Playoff System)**
    const updatePagePlayoffState = () => {
        if (tournament.type === 8) {
            // --- 8-Team: Check if QFs are done ---
            if (tournament.qf1.winner && tournament.qf2.winner && !tournament.q1.teams[0]) {
                tournament.q1.teams = [tournament.qf1.winner, tournament.qf2.winner];
            }
            if (tournament.qf3.winner && tournament.qf4.winner && !tournament.e.teams[0]) {
                tournament.e.teams = [tournament.qf3.winner, tournament.qf4.winner];
            }
        }
        // --- Shared Logic (4 and 8-team) ---
        // Check if Qualifier 1 and Eliminator are done -> Populate Qualifier 2
        if (tournament.q1.loser && tournament.e.winner && !tournament.q2.teams[0]) {
            tournament.q2.teams = [tournament.q1.loser, tournament.e.winner];
        }
        // Check if Qualifier 1 is done -> Populate Final slot 1
        if (tournament.q1.winner && !tournament.f.teams[0]) {
            tournament.f.teams[0] = tournament.q1.winner;
        }
        // Check if Qualifier 2 is done -> Populate Final slot 2
        if (tournament.q2.winner && !tournament.f.teams[1]) {
            tournament.f.teams[1] = tournament.q2.winner;
        }
    };
    // --- END: Page Playoff Specific Functions ---


    // --- START: Single Elimination Specific Functions ---
    const buildSingleElimination = (teams) => {
        const numTeams = teams.length;
        // Find next power of 2
        const bracketSize = Math.pow(2, Math.ceil(Math.log2(numTeams)));
        const numByes = bracketSize - numTeams;
        
        let round = 1;
        let currentTeams = [...teams.map(t => t.id)];
        let nextRoundTeams = [];
        let roundMatches = [];
        let matchNum = 1;
        
        // --- Create Round 1 (with BYEs) ---
        let round1Teams = [];
        let byeTeams = currentTeams.slice(0, numByes);
        let playInTeams = currentTeams.slice(numByes);

        const round1 = { name: `Round 1 (Play-in)`, matchIds: [] };
        // Create play-in matches
        for(let i = 0; i < playInTeams.length; i += 2) {
            const matchId = `M${matchNum++}`;
            const match = {
                id: matchId,
                title: `Match ${matchId}`,
                teams: [playInTeams[i], playInTeams[i+1]],
                winner: null,
                loser: null,
                round: 1,
                nextMatch: null // Will be set later
            };
            tournament.matchesLookup[matchId] = match;
            round1.matchIds.push(matchId);
        }
        
        // Add BYE teams as "winners" of imaginary matches
        byeTeams.forEach(teamId => {
            nextRoundTeams.push(teamId);
        });

        if(round1.matchIds.length > 0) {
            tournament.rounds.push(round1);
        }

        // --- Create Subsequent Rounds ---
        let currentRoundMatchIds = [...round1.matchIds];

        while (nextRoundTeams.length + currentRoundMatchIds.length > 1) {
            // If current round matches are done, their winners go to nextRoundTeams
            if (currentRoundMatchIds.length > 0) {
                 // All winners from currentRoundMatchIds need to be determined
                 // This structure assumes we build the *full* bracket first
            }
            
            // Simplified: Combine pending winners and teams that had byes
            let teamsForThisRound = [...nextRoundTeams];
            // Add placeholders for winners from previous round
            currentRoundMatchIds.forEach(() => teamsForThisRound.push(null));
            
            nextRoundTeams = []; // Clear for next iteration
            
            const roundName = teamsForThisRound.length === 2 ? 'Final' :
                              teamsForThisRound.length === 4 ? 'Semi-Finals' :
                              teamsForThisRound.length === 8 ? 'Quarter-Finals' :
                              `Round ${round + 1}`;
                              
            const currentRoundObj = { name: roundName, matchIds: [] };
            let prevMatchIndex = 0;

            for (let i = 0; i < teamsForThisRound.length; i += 2) {
                const matchId = `M${matchNum++}`;
                const match = {
                    id: matchId,
                    title: `${roundName} - ${i/2 + 1}`,
                    teams: [teamsForThisRound[i], teamsForThisRound[i+1]],
                    winner: null,
                    loser: null,
                    round: round + 1,
                    nextMatch: null // Will be set later
                };
                
                // Link previous round matches to this one
                if (currentRoundMatchIds.length > 0) {
                    if (teamsForThisRound[i] === null) {
                        const prevMatchId = currentRoundMatchIds[prevMatchIndex++];
                        tournament.matchesLookup[prevMatchId].nextMatch = matchId;
                    }
                    if (teamsForThisRound[i+1] === null) {
                        const prevMatchId = currentRoundMatchIds[prevMatchIndex++];
                        tournament.matchesLookup[prevMatchId].nextMatch = matchId;
                    }
                }
                
                tournament.matchesLookup[matchId] = match;
                currentRoundObj.matchIds.push(matchId);
            }
            tournament.rounds.push(currentRoundObj);
            currentRoundMatchIds = [...currentRoundObj.matchIds];
            round++;
        }
    };
    
    const renderSingleElimination = () => {
        tournament.rounds.forEach(round => {
            const col = createBracketColumn(round.name);
            round.matchIds.forEach(matchId => {
                const match = tournament.matchesLookup[matchId];
                col.appendChild(createMatchEl(match));
            });
            tournamentContainer.appendChild(col);
        });
    };

    const updateSingleEliminationState = (match) => {
        if (!match.nextMatch) return; // No next match (e.g., final)

        const nextMatch = tournament.matchesLookup[match.nextMatch];
        if (!nextMatch) return;

        // Find the first empty slot and place the winner
        if (nextMatch.teams[0] === null) {
            nextMatch.teams[0] = match.winner;
        } else if (nextMatch.teams[1] === null) {
            nextMatch.teams[1] = match.winner;
        }
    };
    // --- END: Single Elimination Specific Functions ---


    // ===== SHARED HELPER FUNCTIONS =====

    // Helper to create a column div
    const createBracketColumn = (title) => {
        const col = document.createElement('div');
        col.className = 'bracket-column';
        col.innerHTML = `<h3 class="column-title">${title}</h3>`;
        return col;
    };

    // Helper to create a single match element (WORKS FOR BOTH)
    const createMatchEl = (match) => {
        const matchEl = document.createElement('div');
        matchEl.className = 'match';
        matchEl.innerHTML = `<div class="match-title">${match.title}</div>`;

        const [team1, team2] = match.teams;

        // Create Team 1 Div
        const team1El = document.createElement('div');
        team1El.className = 'team';
        team1El.textContent = team1 ? getTeamById(team1).name : 'TBD';
        if (team1) team1El.dataset.teamId = team1;

        // Create Team 2 Div
        const team2El = document.createElement('div');
        team2El.className = 'team';
        team2El.textContent = team2 ? getTeamById(team2).name : 'TBD';
        if (team2) team2El.dataset.teamId = team2;

        // Add event listeners and styling
        if (team1 && team2 && !match.winner) {
            // Match is ready to be played
            [team1El, team2El].forEach(el => {
                el.classList.add('selectable');
                el.dataset.matchId = match.id; // Universal match ID
                el.addEventListener('click', handleWinnerSelection);
            });
        }

        if (match.winner) {
            // Match is finished, style winner/loser
            if (match.winner === team1) {
                team1El.classList.add('winner');
                team2El.classList.add('loser');
            } else {
                team2El.classList.add('winner');
                team1El.classList.add('loser');
            }
        }

        matchEl.appendChild(team1El);
        matchEl.appendChild(team2El);
        return matchEl;
    };

    // --- Initial setup ---
    showScreen('screen-player-setup');
    updateGroupDropdown(); // Populate saved groups on load
});