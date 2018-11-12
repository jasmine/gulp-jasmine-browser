describe('dummy', function() {
  it('makes a basic passing assertion', function() {
    console.log('A message from the page.');
    expect(true).toBe(true);
  });

  it('makes a basic failing assertion', function() {
    expect(true).toBe(false);
  });
});