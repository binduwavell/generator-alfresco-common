'use strict';
/* eslint-env node, mocha */
var assert = require('assert');
var xmldom = require('xmldom');
var domutils = require('../index').xml_dom_utils;

describe('generator-alfresco-common:xml-dom-utils', function () {
  describe('.createChild()', function () {
    it('create top level element in empty root', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns:ns="http://www.example.com/"/>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.createChild(rootElement, 'ns', 'node');
      assert.ok(element);
      var docStr = domutils.prettyPrint(doc);
      assert.equal(docStr, [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root ',
        '  xmlns:ns="http://www.example.com/">',
        '  <node ',
        '    xmlns="http://www.example.com/"/>',
        '  </root>',
      ].join('\n'));
    });

    it('adding child defaults to adding at the end', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns:ns="http://www.example.com/">',
        '  <element/>',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.createChild(rootElement, 'ns', 'node');
      assert.ok(element);
      var docStr = domutils.prettyPrint(doc);
      assert.equal(docStr, [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root ',
        '  xmlns:ns="http://www.example.com/">',
        '  <element/>',
        '  <node ',
        '    xmlns="http://www.example.com/"/>',
        '  </root>',
      ].join('\n'));
    });

    it('adding child can be set to add to add at the beginning', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns:ns="http://www.example.com/">',
        '  <element/>',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.createChild(rootElement, 'ns', 'node', true);
      assert.ok(element);
      var docStr = domutils.prettyPrint(doc);
      assert.equal(docStr, [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root ',
        '  xmlns:ns="http://www.example.com/">',
        '  <node ',
        '    xmlns="http://www.example.com/"/>',
        '    <element/>',
        '  </root>',
      ].join('\n'));
    });
  });

  describe('.getChild()', function () {
    it('get top level element', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getChild(rootElement, 'ns', 'element');
      assert.ok(element);
      assert.ok(element.nodeType === element.ELEMENT_NODE);
    });

    it('undefined for non-existent child', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getChild(rootElement, 'ns', 'garbage');
      assert.equal(element, undefined);
    });
  });

  describe('.getChildren()', function () {
    it('get top level elements', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element />',
        '  <element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var elements = domutils.getChildren(rootElement, 'ns', 'element');
      assert.ok(elements);
      assert.equal(elements.length, 2);
      assert.ok(elements[0].nodeType === elements[0].ELEMENT_NODE);
      assert.ok(elements[1].nodeType === elements[1].ELEMENT_NODE);
    });

    it('undefined for non-existent children', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var elements = domutils.getChildren(rootElement, 'ns', 'garbage');
      assert.equal(elements.length, 0);
    });
  });

  describe('.removeChild()', function () {
    it('delete top level element', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns:ns="http://www.example.com/">',
        '  <ns:element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      domutils.removeChild(rootElement, 'ns', 'element');
      var docStr = domutils.prettyPrint(doc);
      assert.equal(docStr, [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root ',
        '  xmlns:ns="http://www.example.com/">',
        '</root>',
      ].join('\n'));
    });
  });

  describe('.removeParentsChild()', function () {
    it('deletes top level element', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns:ns="http://www.example.com/">',
        '  <ns:element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getChild(rootElement, 'ns', 'element');
      domutils.removeParentsChild(rootElement, element);
      var docStr = domutils.prettyPrint(doc);
      assert.equal(docStr, [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root ',
        '  xmlns:ns="http://www.example.com/">',
        '</root>',
      ].join('\n'));
    });

    it('does not delete if not parent/child', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns:ns="http://www.example.com/">',
        '  <ns:element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getChild(rootElement, 'ns', 'element');
      domutils.removeParentsChild(element, rootElement);
      var docStr = domutils.prettyPrint(doc);
      assert.equal(docStr, [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root ',
        '  xmlns:ns="http://www.example.com/">',
        '  <ns:element/>',
        '</root>',
      ].join('\n'));
    });
  });

  describe('.getOrCreateChild()', function () {
    it('get top level element', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element foo="bar"/>',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getOrCreateChild(rootElement, 'ns', 'element');
      assert.ok(element);
      assert.ok(element.nodeType === element.ELEMENT_NODE);
      var elementStr = domutils.prettyPrint(element);
      assert.equal(elementStr, [
        '<element foo="bar" ',
        '  xmlns="http://www.example.com/"/>',
      ].join('\n'));
    });

    it('create top level element', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getOrCreateChild(rootElement, 'ns', 'element');
      assert.ok(element);
      assert.ok(element.nodeType === element.ELEMENT_NODE);
      var elementStr = domutils.prettyPrint(element);
      assert.equal(elementStr, [
        '<element ',
        '  xmlns="http://www.example.com/"/>',
      ].join('\n'));
    });
  });

  describe('.getNextElementSibling()', function () {
    it('Get undefined when no node', function () {
      var sibling = domutils.getNextElementSibling();
      assert.equal(sibling, undefined);
    });

    it('Get null when no sibling', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getChild(rootElement, 'ns', 'element');
      assert.ok(element);
      var sibling = domutils.getNextElementSibling(element);
      assert.equal(sibling, null);
    });

    it('Get sibling when exists', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element /><element2 />',
        '  <element3 />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getChild(rootElement, 'ns', 'element');
      assert.ok(element);
      var sibling1 = domutils.getNextElementSibling(element);
      assert.ok(sibling1);
      assert.ok(sibling1.nodeType === sibling1.ELEMENT_NODE);
      var sibling1Str = domutils.prettyPrint(sibling1);
      assert.equal(sibling1Str, [
        '<element2 ',
        '  xmlns="http://www.example.com/"/>',
      ].join('\n'));
      var sibling2 = domutils.getNextElementSibling(sibling1);
      assert.ok(sibling2);
      assert.ok(sibling2.nodeType === sibling2.ELEMENT_NODE);
      var sibling2Str = domutils.prettyPrint(sibling2);
      assert.equal(sibling2Str, [
        '<element3 ',
        '  xmlns="http://www.example.com/"/>',
      ].join('\n'));
    });
  });

  describe('.setOrClearChildText()', function () {
    it('can add text to existing element', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      domutils.setOrClearChildText(rootElement, 'ns', 'element', 'it worked');
      var element = domutils.getChild(rootElement, 'ns', 'element');
      assert.ok(element);
      assert.equal(element.textContent, 'it worked');
    });

    it('adds element if necessary', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      domutils.setOrClearChildText(rootElement, 'ns', 'element', 'it worked');
      var element = domutils.getChild(rootElement, 'ns', 'element');
      assert.ok(element);
      assert.equal(element.textContent, 'it worked');
    });

    it('removes element when text is contra indicated', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      domutils.setOrClearChildText(rootElement, 'ns', 'element', 'it is contra indicated', 'it is contra indicated');
      var element = domutils.getChild(rootElement, 'ns', 'element');
      assert.equal(element, undefined);
    });
  });

  describe('.getFirstNodeMatchingXPath()', function () {
    it('finds element in a document using an absolute xpath', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <stuff/>',
        '  <profiles>',
        '    <profile>',
        '      <id>foo</id>',
        '      <build>',
        '        <plugins>',
        '          <plugin>this is the first wrong one</plugin>',
        '          <plugin>this is the wrong two</plugin>',
        '        </plugins>',
        '      </build>',
        '    </profile>',
        '    <profile>',
        '      <id>functional-testing</id>',
        '      <build>',
        '        <plugins>',
        '          <plugin>you found me</plugin>',
        '          <plugin>this is the other wrong one</plugin>',
        '        </plugins>',
        '      </build>',
        '    </profile>',
        '  </profiles>',
        '  <otherstuff/>',
        '</project>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(pomString, 'text/xml');
      assert.ok(doc);
      var xp = "/pom:project/pom:profiles/pom:profile[pom:id='functional-testing']/pom:build/pom:plugins/pom:plugin[1]";
      var element = domutils.getFirstNodeMatchingXPath(xp, doc);
      assert.equal(domutils.prettyPrint(element), [
        '<plugin ',
        '  xmlns="http://maven.apache.org/POM/4.0.0">you found me',
        '</plugin>',
      ].join('\n'));
    });

    it('finds element under an element using a relative xpath', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <stuff/>',
        '  <profiles>',
        '    <profile>',
        '      <id>foo</id>',
        '      <build>',
        '        <plugins>',
        '          <plugin>this is the first wrong one</plugin>',
        '          <plugin>this is the wrong two</plugin>',
        '        </plugins>',
        '      </build>',
        '    </profile>',
        '    <profile>',
        '      <id>functional-testing</id>',
        '      <build>',
        '        <plugins>',
        '          <plugin>you found me</plugin>',
        '          <plugin>this is the other wrong one</plugin>',
        '        </plugins>',
        '      </build>',
        '    </profile>',
        '  </profiles>',
        '  <otherstuff/>',
        '</project>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(pomString, 'text/xml');
      assert.ok(doc);
      var xp1 = "/pom:project/pom:profiles/pom:profile[pom:id='functional-testing']";
      var element1 = domutils.getFirstNodeMatchingXPath(xp1, doc);
      var xp2 = 'pom:build/pom:plugins/pom:plugin[1]';
      var element2 = domutils.getFirstNodeMatchingXPath(xp2, element1);
      assert.equal(domutils.prettyPrint(element2), [
        '<plugin ',
        '  xmlns="http://maven.apache.org/POM/4.0.0">you found me',
        '</plugin>',
      ].join('\n'));
    });

    it('finds element in maven file with property value match', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0">',
        '  <stuff>${property}</stuff>',
        '</project>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(pomString, 'text/xml');
      assert.ok(doc);
      var xp = "/pom:project[pom:stuff = '${property}']/pom:stuff";
      var element = domutils.getFirstNodeMatchingXPath(xp, doc);
      assert.equal(domutils.prettyPrint(element), [
        '<stuff ',
        '  xmlns="http://maven.apache.org/POM/4.0.0">${property}',
        '</stuff>',
      ].join('\n'));
    });

    it('returns undefined when no node matches', function () {
      var pomString = '<?xml version="1.0" encoding="UTF-8"?><project/>';
      var doc = new xmldom.DOMParser().parseFromString(pomString, 'text/xml');
      assert.ok(doc);
      var xp = '/pom:project/pom:stuff';
      var element = domutils.getFirstNodeMatchingXPath(xp, doc);
      assert.equal(element, undefined);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
