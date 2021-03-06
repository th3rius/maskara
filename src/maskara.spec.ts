import Maskara, {MaskaraOptions} from './maskara';

interface TestCase {
  text: string;
  pattern: string;
  expected: string;
  valid: boolean;
  options?: MaskaraOptions;
}

describe('mask-formatter', () => {
  function test(p: TestCase) {
    const processed = Maskara.process(p.text, p.pattern, p.options);
    expect(processed.result).toBe(p.expected);
    expect(processed.valid).toBe(p.valid);
  }

  describe('number:', () => {
    const p = {
      text: '7612345678980',
      pattern: '#.##0,00',
      expected: '76.123.456.789,80',
      valid: true,
      options: {reverse: true},
    };
    it("reverse '#.##0,00' should format '7612345678980' to '76.123.456.789,80'", done => {
      test(p);
      done();
    });
    it("reverse '#.##0,00' should format '112' to '1,12'", done => {
      p.text = '112';
      p.expected = '1,12';
      test(p);
      done();
    });
    it("reverse '#.##0,00' should format '12345678a80' to ',80' and be invalid", done => {
      p.text = '12345678a80';
      p.expected = ',80';
      p.valid = false;
      test(p);
      done();
    });
    it("reverse '#.##0' should format '123456789' to '123.456.789'", done => {
      p.pattern = '#.##0';
      p.text = '123456789';
      p.expected = '123.456.789';
      p.valid = true;
      test(p);
      done();
    });
    it("reverse '#0' should format '123456788' to '123456788'", done => {
      p.pattern = '#0';
      p.text = '123456788';
      p.expected = '123456788';
      p.valid = true;
      test(p);
      done();
    });
    it("reverse '#,0' should format '123456788' to '12345678,8'", done => {
      p.pattern = '#,0';
      p.text = '123456788';
      p.expected = '12345678,8';
      p.valid = true;
      test(p);
      done();
    });
    it("reverse '#.##0,00' should format '1' to '0,01'", done => {
      test({
        text: '1',
        pattern: '#.##0,00',
        expected: '0,01',
        valid: true,
        options: {reverse: true},
      });
      done();
    });
  });

  describe('percentage:', () => {
    const p: TestCase = {
      text: '7612345678980',
      pattern: '#.##0,00 %',
      expected: '76.123.456.789,80 %',
      valid: true,
      options: {reverse: true},
    };
    it("reverse '#.##0,00 %' should format '7612345678980' to '76.123.456.789,80 %'", done => {
      test(p);
      done();
    });
    it("reverse '#.##0,00 %' should format '123a4567810' to '45.678,10 %' and be invalid", done => {
      p.text = '123a4567810';
      p.expected = '45.678,10 %';
      p.valid = false;
      test(p);
      done();
    });
    it("reverse '#0,00%' should format '1234567810' to '12345678,10%' and be invalid", done => {
      p.pattern = '#0,00%';
      p.text = '1234567810';
      p.expected = '12345678,10%';
      p.valid = true;
      test(p);
      done();
    });
    it("'0,#' should format '1234567' to '1,234567'", done => {
      p.pattern = '0,#';
      p.text = '1234567';
      p.expected = '1,234567';
      p.valid = true;
      p.options = {reverse: false};
      test(p);
      done();
    });
  });

  describe('money:', () => {
    const p: TestCase = {
      text: '7612345678980',
      pattern: 'R$ #.##0,00',
      expected: 'R$ 76.123.456.789,80',
      valid: true,
      options: {reverse: true},
    };
    it("reverse 'R$ #.##0,00' should format '7612345678980' to 'R$ 76.123.456.789,80'", done => {
      test(p);
      done();
    });
    it("reverse 'R$ #.##0,00' should format '100' to 'R$ 1,00'", done => {
      p.text = '100';
      p.expected = 'R$ 1,00';
      test(p);
      done();
    });
    it("reverse 'R$ #.##0,00' should format '1' to 'R$ 0,01'", done => {
      p.text = '1';
      p.expected = 'R$ 0,01';
      test(p);
      done();
    });
    it("reverse 'R$ #.##0,00' should format '123a4567810' to '45.678,10' and be invalid", done => {
      p.text = '123a4567810';
      p.expected = '45.678,10';
      p.valid = false;
      test(p);
      done();
    });
    it("reverse '$ #,##0.000' should format '7612345678980' to '$ 7,612,345,678.980'", done => {
      p.pattern = '$ #,##0.000';
      p.text = '7612345678980';
      p.expected = '$ 7,612,345,678.980';
      p.valid = true;
      test(p);
      done();
    });
  });

  describe('CPF:', () => {
    const p: TestCase = {
      text: '12345678980',
      pattern: '000.000.000-00',
      expected: '123.456.789-80',
      valid: true,
    };
    it("'000.000.000-00' should format '12345678980' to '123.456.789-80'", done => {
      test(p);
      done();
    });
    it("reverse '000.000.000-00' should format '12345678980' to '123.456.789-80'", done => {
      p.options = {reverse: true};
      test(p);
      done();
    });
    it("'000.000.000-00' should format '12345678a80' to '123.456.78'", done => {
      p.options = {reverse: false};
      p.text = '12345678a80';
      p.expected = '123.456.78';
      p.valid = false;
      test(p);
      done();
    });
  });

  describe('Date:', () => {
    const p: TestCase = {
      text: '23111987',
      pattern: '90/90/9900',
      expected: '23/11/1987',
      valid: true,
    };
    it("'90/90/9900' should format '23111987' to '23/11/1987'", done => {
      test(p);
      done();
    });
    it("'90/90/9900' should format '1187' to '1/1/87'", done => {
      p.text = '1187';
      p.expected = '1/1/87';
      test(p);
      done();
    });
  });

  describe('phone:', () => {
    it("'+00 (00) 0000-0000' should format '553122222222' to '+55 (31) 2222-2222'", done => {
      const formatter = new Maskara('+00 (00) 0000-0000');
      const processed = formatter.process('553122222222');
      expect(processed.result).toBe('+55 (31) 2222-2222');
      expect(processed.valid).toBe(true);
      done();
    });

    const p: TestCase = {
      text: '553122222222',
      pattern: '+00 (00) 90000-0000',
      expected: '+55 (31) 2222-2222',
      valid: true,
    };
    it("'+00 (00) 90000-0000' should format '553122222222' to '+55 (31) 2222-2222'", done => {
      test(p);
      done();
    });
    it("reverse '+00 (00) 90000-0000' should format '553122222222' to '+55 (31) 2222-2222'", done => {
      p.options = {reverse: true};
      test(p);
      done();
    });
    it("'+00 (00) 90000-0000' should format '5531622222222' to '+55 (31) 62222-2222'", done => {
      p.options = {reverse: false};
      p.text = '5531622222222';
      p.expected = '+55 (31) 62222-2222';
      test(p);
      done();
    });
    it("'+00 (00) 90000-0000' should format '5531622222222' to '+55 (31) 62222-2222'", done => {
      p.options = {reverse: true};
      test(p);
      done();
    });
  });

  describe('RG:', () => {
    const p: TestCase = {
      text: 'mg11862459',
      pattern: 'SS 00.000.000',
      expected: 'mg 11.862.459',
      valid: true,
    };
    it("'SS 00.000.000' should format 'mg11862459' to 'mg 11.862.459'", done => {
      test(p);
      done();
    });
    it("reverse 'SS 00.000.000' should format 'mg11862459' to 'mg 11.862.459'", done => {
      p.options = {reverse: true};
      test(p);
      done();
    });
  });

  describe('Case:', () => {
    it("'UUUUUUU' should format 'Testing' to 'TESTING'", done => {
      test({
        text: 'Testing',
        pattern: 'UUUUUUU',
        expected: 'TESTING',
        valid: true,
      });
      done();
    });
    it("'LLLLLLL' should format 'Testing' to 'testing'", done => {
      test({
        text: 'Testing',
        pattern: 'LLLLLLL',
        expected: 'testing',
        valid: true,
      });
      done();
    });
  });

  describe('Scientific notations:', () => {
    it("'0.00E#' should format '12310' to '1.23E10'", done => {
      test({
        text: '12310',
        pattern: '0.00E#',
        expected: '1.23E10',
        valid: true,
      });
      done();
    });
    it("'0.0E#' should format '12310' to '1.2E310'", done => {
      test({
        text: '12310',
        pattern: '0.0E#',
        expected: '1.2E310',
        valid: true,
      });
      done();
    });
    it("'0.000E#' should format '123' to '1.23'", done => {
      test({
        text: '123',
        pattern: '0.000E#',
        expected: '1.23',
        valid: false,
      });
      done();
    });
  });

  describe('Iban:', () => {
    it(
      "'UUAA AAAA AAAA AAAA AAAA AAAA AAA' should format 'FR761111900069410000AA33222' " +
        "to 'FR76 1111 BBBB 6941 0000 AA33 222'",
      done => {
        test({
          text: 'FR761111BBBB69410000AA33222',
          pattern: 'UUAA AAAA AAAA AAAA AAAA AAAA AAA',
          expected: 'FR76 1111 BBBB 6941 0000 AA33 222',
          valid: true,
        });
        done();
      }
    );
    it(
      "'UUAA AAAA AAAA AAAA AAAA AAAA AAA' should format 'FR761111900069410000AA33222' to " +
        "'FR76 1111 BBBB 6941 0000 AA33'",
      done => {
        test({
          text: 'FR761111BBBB69410000AA-3222',
          pattern: 'UUAA AAAA AAAA AAAA AAAA AAAA AAA',
          expected: 'FR76 1111 BBBB 6941 0000 AA',
          valid: false,
        });
        done();
      }
    );
  });

  describe('Other usages:', () => {
    it('Should run validate', done => {
      expect(Maskara.validate('mg11862459', 'SS 00.000.000')).toBeTruthy();
      expect(
        Maskara.validate('1011862459', 'SS 00.000.000')
      ).not.toBeTruthy();
      done();
    });
    it('Should apply mask', done => {
      expect(Maskara.apply('mg11862459', 'SS 00.000.000')).toBe(
        'mg 11.862.459'
      );
      done();
    });
    it('Should not apply mask on empty values', done => {
      expect(Maskara.apply('', 'SS 00.000.000')).toBe('');
      expect(Maskara.apply(null, 'SS 00.000.000')).toBe('');
      expect(Maskara.apply(undefined, 'SS 00.000.000')).toBe('');
      done();
    });
    it('should not escape in the recursive portion of pattern', done => {
      expect(Maskara.apply('123', 'YZ #.##0,00', {reverse: true})).toBe(
        'YZ 1,23'
      );
      expect(Maskara.apply('123', 'YZ#.##0,00', {reverse: true})).toBe(
        'YZ1,23'
      );
      expect(Maskara.apply('123', 'US #.##0,00', {reverse: true})).toBe(
        'US 1,23'
      );
      expect(Maskara.apply('123', 'US.#.##0,00', {reverse: true})).toBe(
        'US.1,23'
      );
      expect(
        Maskara.apply('123456789', 'US #,##0.00', {reverse: true})
      ).toBe('US 1,234,567.89');
      expect(
        Maskara.apply('123456789', '$U$S #,##0.00', {reverse: true})
      ).toBe('$U$S 1,234,567.89');

      expect(Maskara.apply('123', '00,# YZ')).toBe('12,3 YZ');
      expect(Maskara.apply('123', '00,0##.# US')).toBe('12,3 US');
      expect(Maskara.apply('123456789', '00,0##.# US')).toBe(
        '12,345.678.9 US'
      );
      expect(Maskara.apply('123456789', '00,0##.# $U$S')).toBe(
        '12,345.678.9 $U$S'
      );

      expect(Maskara.apply('123456789', '#L##0,00', {reverse: true})).toBe(
        '1L234L567,89'
      );
      done();
    });
    it('should work with escaped tokens', done => {
      expect(Maskara.apply('125', '$##')).toBe('#125');
      expect(Maskara.apply('125', '#$#', {reverse: true})).toBe('125#');
      expect(Maskara.apply('JUSTTEST', 'AAAA $A AAAA')).toBe('JUST A TEST');

      expect(Maskara.process('125a123', '$##')).toStrictEqual({
        result: '#125',
        valid: false,
      });

      done();
    });
  });
});
