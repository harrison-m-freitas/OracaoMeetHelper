/**
 * Splits a list of prayer requests into sequential groups,
 * based on either the number of participants or a fixed number of requests per person.
 *
 * @param {string[]} requests - The full list of prayer requests.
 * @param {number|null} participantCount - Total number of participants (if using that method).
 * @param {number|null} fixedPerPerson - Optional: fixed number of requests per person.
 * @returns {string[][]} An array of groups, each group being a list of requests for one person.
 */
export function splitPrayerRequests(requests, participantCount = null, fixedPerPerson = null) {
  console.log('[OracaoMeetHelper] Splitting prayer requests...');
  console.log(`[OracaoMeetHelper] Total requests: ${requests.length}`);
  console.log(`[OracaoMeetHelper] Participant count: ${participantCount}`);

  const total = requests.length;
  if (total === 0) return [];

  if (fixedPerPerson && fixedPerPerson > 0) {
    participantCount = Math.ceil(total / fixedPerPerson);
  }

  if (!participantCount || participantCount < 1){
    throw new Error('Invalid participant count or fixed requests per person.');
  }

  const baseCount = Math.floor(total / participantCount);
  const remainder = total % participantCount;

  const result = [];
  let index = 0;

  for (let i = 0; i < participantCount; i++) {
    const count = baseCount + (i < remainder ? 1 : 0);
    const chunk = requests.slice(index, index + count);
    result.push(chunk);
    index += count;
  }

  return result;
}
