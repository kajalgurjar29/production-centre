function formatEnquiryReference(sequenceNumber) {
  return 'ENQ-' + String(sequenceNumber).padStart(6, '0');
}

function formatReviewReference(sequenceNumber) {
  return 'RV-' + String(sequenceNumber).padStart(6, '0');
}

function formatAdvertReference(sequenceNumber) {
  return 'AC-' + String(sequenceNumber).padStart(6, '0');
}

module.exports = { formatEnquiryReference, formatReviewReference, formatAdvertReference };
